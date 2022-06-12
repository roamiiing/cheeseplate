import { Telegraf } from 'telegraf'

import { CheeseBot, InputMapper } from '@/libs/shared/bot'
import { stripFirst } from '@/libs/shared/strings'
import { UseCase } from '@/libs/shared/workflow'

import { wrapUseCase } from './use-case.wrapper'

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
}
