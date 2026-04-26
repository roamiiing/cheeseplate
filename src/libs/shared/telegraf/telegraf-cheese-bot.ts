import { captureException } from '@sentry/node'
import { Telegraf } from 'telegraf'

import { CheeseBot, InputMapper, Options } from '@/libs/shared/bot'
import { Queue } from '@/libs/shared/queue'
import { stripFirst } from '@/libs/shared/strings'
import { GeneratorUseCase, UseCase } from '@/libs/shared/workflow'

import { wrapGeneratorUseCase } from './generator-use-case.wrapper'
import { processResult, wrapUseCase } from './use-case.wrapper'

export type TelegrafCheeseBotDeps = {
  bot: Telegraf
  queue: Queue
}

export class TelegrafCheeseBot implements CheeseBot {
  constructor(private readonly _deps: TelegrafCheeseBotDeps) {}

  useCommand<Input>(
    command: string,
    useCase: UseCase<Input>,
    inputMapper: InputMapper<Input> = () => undefined as unknown as Input,
  ) {
    this._deps.bot.command(command, async ctx => {
      const message = ctx.message.text

      await wrapUseCase(
        ctx,
        useCase,
        this._deps.queue,
        inputMapper({
          rawMessage: message,
          strippedMessage: stripFirst(message),
        }),
      )
    })

    return this
  }

  useGeneratorCommand<Input>(
    command: string,
    useCase: GeneratorUseCase<Input>,
    inputMapper: InputMapper<Input> | undefined = () =>
      undefined as unknown as Input,
    options: Options = {},
  ) {
    const { maxInProgress = Infinity } = options

    let inProgress = 0

    this._deps.bot.command(command, async ctx => {
      if (inProgress < maxInProgress) {
        inProgress++
        const message = ctx.message.text

        try {
          await wrapGeneratorUseCase(
            ctx,
            useCase,
            this._deps.queue,
            inputMapper({
              rawMessage: message,
              strippedMessage: stripFirst(message),
            }),
          )
        } catch (e) {
          console.error('Error with telegram answering', e)
          captureException(e)
        } finally {
          inProgress--
        }
      } else {
        await processResult(
          {
            message:
              'Прости, но не в этот раз :(\nЭта команда очень ресурсозатратная и сейчас очередь переполнена! Приходи позже 👻',
          },
          ctx,
          this._deps.queue,
        )
      }
    })

    return this
  }
}
