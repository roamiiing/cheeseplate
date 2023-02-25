import { Router } from '@grammyjs/router'
import { Message } from '@grammyjs/types'
import { Context, InputFile } from 'grammy'

import { DalleStatus } from '@/libs/neuro/application'
import { DallePrompt } from '@/libs/neuro/domain'
import { NeuroContainerItems } from '@/libs/neuro/infrastructure'
import { joinImages } from '@/libs/shared/images'
import { stripFirst } from '@/libs/shared/strings'
import { mapZodError } from '@/libs/shared/validation'
import { ScopedLogger } from '@/libs/shared/workflow'

export class DalleHandler {
  private _router = new Router<Context>(() => 'dalle')

  constructor(private _deps: NeuroContainerItems) {
    this._registerDalleHandler()
  }

  get router(): Router<Context> {
    return this._router
  }

  private _registerDalleHandler(): void {
    this._router.route('dalle').command('dalle', async ctx => {
      this._logger.info('dalle command')

      const { dalleUseCase: useCase, localeStore: t } = this._deps

      const prompt = stripFirst(ctx.message?.text ?? '')
      const validatedPrompt = await DallePrompt.safeParseAsync(prompt)

      if (!validatedPrompt.success) {
        return await ctx.reply(mapZodError(validatedPrompt.error), {
          reply_to_message_id: ctx.message?.message_id,
        })
      }

      let messageToDelete: Message | null = null

      try {
        for await (const output of useCase(validatedPrompt.data)) {
          switch (output.status) {
            case DalleStatus.Wait: {
              messageToDelete = await ctx.reply(
                t.get('dalle.wait', validatedPrompt.data),
                {
                  reply_to_message_id: ctx.message?.message_id,
                  disable_notification: true,
                  parse_mode: 'HTML',
                },
              )

              break
            }

            case DalleStatus.UnderLoad: {
              this._logger.info('service is under load')

              await ctx.reply(t.get('dalle.underLoad'), {
                reply_to_message_id: ctx.message?.message_id,
                disable_notification: true,
              })

              break
            }

            case DalleStatus.Images: {
              const joined = await joinImages(output.images)

              await ctx.replyWithPhoto(new InputFile(joined), {
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
        await ctx.reply(t.get('dalle.error'), {
          reply_to_message_id: ctx.message?.message_id,
          disable_notification: true,
        })
        throw error
      }
    })
  }

  private get _logger(): ScopedLogger {
    return this._deps.logger.withScope('dalle')
  }
}
