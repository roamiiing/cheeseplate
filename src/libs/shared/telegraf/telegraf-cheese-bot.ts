import { Telegraf } from 'telegraf'
import { captureException } from '@sentry/node'

import { CheeseBot, InputMapper, Options } from '@/libs/shared/bot'
import { stripFirst } from '@/libs/shared/strings'
import { GeneratorUseCase, UseCase } from '@/libs/shared/workflow'
import { Queue } from '@/libs/shared/queue'

import { processResult, wrapUseCase } from './use-case.wrapper'
import { wrapGeneratorUseCase } from './generator-use-case.wrapper'

export type TelegrafCheeseBotDeps = {
  bot: Telegraf
  queue: Queue
}

export class TelegrafCheeseBot implements CheeseBot {
  constructor(private readonly deps: TelegrafCheeseBotDeps) {}

  useCommand<Input>(
    command: string,
    useCase: UseCase<Input>,
    inputMapper: InputMapper<Input> = () => undefined as any,
  ) {
    this.deps.bot.command(command, async ctx => {
      const message = ctx.message.text

      await wrapUseCase(
        ctx,
        useCase,
        this.deps.queue,
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
    inputMapper: InputMapper<Input> | undefined = () => undefined as any,
    options: Options = {},
  ) {
    const { maxInProgress = Infinity } = options

    let inProgress = 0

    this.deps.bot.command(command, ctx => {
      ;(async () => {
        if (inProgress < maxInProgress) {
          inProgress++
          const message = ctx.message.text

          try {
            await wrapGeneratorUseCase(
              ctx,
              useCase,
              this.deps.queue,
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
          processResult(
            {
              message:
                'Прости, но не в этот раз :(\nЭта команда очень ресурсозатратная и сейчас очередь переполнена! Приходи позже 👻',
            },
            ctx,
            this.deps.queue,
          )
        }
      })()
    })

    return this
  }
}
