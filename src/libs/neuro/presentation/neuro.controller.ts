import { Message } from '@grammyjs/types'
import { Bot, InputFile } from 'grammy'

import { DalleStatus, DalleUseCase } from '@/libs/neuro/application'
import { DallePrompt } from '@/libs/neuro/domain'
import { createNeuroContainer } from '@/libs/neuro/infrastructure'
import { joinImages } from '@/libs/shared/images'
import { stripFirst } from '@/libs/shared/strings'
import { mapZodError } from '@/libs/shared/validation'
import { Controller, Logger, ScopedLogger } from '@/libs/shared/workflow'

export type NeuroControllerDeps = {
  bot: Bot
  dalleUseCase: DalleUseCase
  logger: Logger
}

export class NeuroController implements Controller {
  private readonly _container = createNeuroContainer({
    maxConcurrentDalleRequests: 10,
  })

  constructor(private readonly _deps: NeuroControllerDeps) {}

  public register(): void {
    this._registerDalleHandler()
  }

  private _registerDalleHandler(): void {
    this._deps.bot.command('dalle', async ctx => {
      this._logger.info('dalle command')

      const useCase = this._container.cradle.dalleUseCase

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
              messageToDelete = await ctx.reply('Wait a second...', {
                reply_to_message_id: ctx.message?.message_id,
              })

              break
            }

            case DalleStatus.UnderLoad: {
              this._logger.info('service is under load')

              await ctx.reply('Dalle is under load, try again later', {
                reply_to_message_id: ctx.message?.message_id,
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
        await ctx.reply('Something went wrong', {
          reply_to_message_id: ctx.message?.message_id,
        })
        throw error
      }
    })
  }

  private get _logger(): ScopedLogger {
    return this._deps.logger.withScope('NeuroController')
  }
}
