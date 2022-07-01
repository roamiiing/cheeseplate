import { Telegraf } from 'telegraf'

import { CheeseBot, InputMapper, Options } from '@/libs/shared/bot'
import { stripFirst } from '@/libs/shared/strings'
import { GeneratorUseCase, UseCase } from '@/libs/shared/workflow'

import { wrapUseCase } from './use-case.wrapper'
import { wrapGeneratorUseCase } from './generator-use-case.wrapper'

export class TelegrafCheeseBot implements CheeseBot {
  constructor(private readonly telegrafBot: Telegraf) {}

  useCommand<Input>(
    command: string,
    useCase: UseCase<Input>,
    inputMapper: InputMapper<Input> = () => undefined as any,
  ) {
    this.telegrafBot.command(command, async ctx => {
      const message = ctx.message.text

      await wrapUseCase(
        ctx,
        useCase,
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

    this.telegrafBot.command(command, ctx => {
      ;(async () => {
        if (inProgress < maxInProgress) {
          inProgress++
          const message = ctx.message.text

          await wrapGeneratorUseCase(
            ctx,
            useCase,
            inputMapper({
              rawMessage: message,
              strippedMessage: stripFirst(message),
            }),
          )

          inProgress--
        } else {
          ctx.replyWithHTML(
            `Прости, но не в этот раз :(\nЭта команда очень ресурсозатратная и сейчас очередь переполнена! Приходи позже 👻`,
            {
              reply_to_message_id: ctx.message.message_id,
            },
          )
        }
      })()
    })

    return this
  }
}
