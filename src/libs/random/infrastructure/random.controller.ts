import {
  BEN_COMMAND,
  PICK_COMMAND,
  ROLL_COMMAND,
} from '@/libs/random/application'
import { CheeseBot } from '@/libs/shared/bot'
import { PriorityBuilder } from '@/libs/shared/workflow'

import { createTagsContainer } from './random.container'

export type RandomControllerDeps = {
  cheeseBot: CheeseBot
  botBuilder: PriorityBuilder
}

export const configureRandom =
  ({ cheeseBot, botBuilder }: RandomControllerDeps) =>
  () => {
    const randomContainer = createTagsContainer()

    botBuilder.add(() => {
      cheeseBot
        .useCommand(ROLL_COMMAND, randomContainer.cradle.rollUseCase, ctx => ({
          message: ctx.strippedMessage,
        }))
        .useCommand(BEN_COMMAND, randomContainer.cradle.benUseCase)
        .useCommand(PICK_COMMAND, randomContainer.cradle.pickUseCase, ctx => ({
          choices: ctx.strippedMessage
            .split(/\n/.test(ctx.strippedMessage) ? '\n' : ',')
            .map(v => v.trim())
            .filter(v => !!v),
        }))
    })
  }
