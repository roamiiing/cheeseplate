import { Router } from '@grammyjs/router'
import { Message } from '@grammyjs/types'
import { Context } from 'grammy'

import { RugptStatus } from '@/libs/neuro/application'
import { RugptPrompt } from '@/libs/neuro/domain'
import { NeuroContainerItems } from '@/libs/neuro/infrastructure'
import { escapeAll, stripFirst } from '@/libs/shared/strings'
import { mapLocalizedZodError } from '@/libs/shared/validation'
import { ScopedLogger } from '@/libs/shared/workflow'

export class RugptHandler {
  private _router = new Router<Context>(() => 'rugpt')

  constructor(private _deps: NeuroContainerItems) {
    this._registerRugptHandler()
  }

  get router(): Router<Context> {
    return this._router
  }

  private _registerRugptHandler(): void {
    this._router.route('rugpt').command('rugpt', async ctx => {
      this._logger.info('rugpt command')

      const { rugptUseCase: useCase, localeStore: t } = this._deps

      const prompt = stripFirst(ctx.message?.text ?? '')

      const validatedPrompt = await RugptPrompt.safeParseAsync(prompt)

      if (!validatedPrompt.success) {
        return await ctx.reply(mapLocalizedZodError(t)(validatedPrompt.error), {
          reply_to_message_id: ctx.message?.message_id,
          parse_mode: 'HTML',
        })
      }

      let messageToDelete: Message | null = null

      try {
        for await (const output of useCase(validatedPrompt.data)) {
          switch (output.status) {
            case RugptStatus.Wait: {
              messageToDelete = await ctx.reply(
                t.get('rugpt.wait', validatedPrompt.data),
                {
                  reply_to_message_id: ctx.message?.message_id,
                  disable_notification: true,
                },
              )

              break
            }

            case RugptStatus.UnderLoad: {
              this._logger.info('service is under load')

              await ctx.reply(t.get('rugpt.underLoad'), {
                reply_to_message_id: ctx.message?.message_id,
                disable_notification: true,
              })

              break
            }

            case RugptStatus.Text: {
              await ctx.reply(escapeAll(output.text), {
                reply_to_message_id: ctx.message?.message_id,
              })

              break
            }
          }
        }

        if (messageToDelete) {
          await ctx.api.deleteMessage(
            messageToDelete.chat.id,
            messageToDelete.message_id,
          )
        }
      } catch (error) {
        await ctx.reply(t.get('rugpt.errors.unknown'), {
          reply_to_message_id: ctx.message?.message_id,
          disable_notification: true,
        })
        throw error
      }
    })
  }

  private get _logger(): ScopedLogger {
    return this._deps.logger.withScope('rugpt')
  }
}
