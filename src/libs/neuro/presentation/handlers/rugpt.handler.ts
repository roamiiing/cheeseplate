import { Router } from '@grammyjs/router'
import { Message } from '@grammyjs/types'
import { Context } from 'grammy'

import { RugptStatus } from '@/libs/neuro/application'
import { RugptPrompt } from '@/libs/neuro/domain'
import { NeuroContainerItems } from '@/libs/neuro/infrastructure'
import { stripFirst } from '@/libs/shared/strings'
import { mapZodError } from '@/libs/shared/validation'
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

      const useCase = this._deps.rugptUseCase

      const prompt = stripFirst(ctx.message?.text ?? '')

      const validatedPrompt = await RugptPrompt.safeParseAsync(prompt)

      if (!validatedPrompt.success) {
        return await ctx.reply(mapZodError(validatedPrompt.error), {
          reply_to_message_id: ctx.message?.message_id,
        })
      }

      let messageToDelete: Message | null = null

      try {
        for await (const output of useCase(validatedPrompt.data)) {
          switch (output.status) {
            case RugptStatus.Wait: {
              messageToDelete = await ctx.reply('Wait a second...', {
                reply_to_message_id: ctx.message?.message_id,
                disable_notification: true,
              })

              break
            }

            case RugptStatus.UnderLoad: {
              this._logger.info('service is under load')

              await ctx.reply('Rugpt is under load, try again later', {
                reply_to_message_id: ctx.message?.message_id,
                disable_notification: true,
              })

              break
            }

            case RugptStatus.Text: {
              await ctx.reply(output.text, {
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
        await ctx.reply('Something went wrong', {
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
