import { DALLE_COMMAND, RUGPT_COMMAND } from '@/libs/neuro/application'
import { CheeseBot } from '@/libs/shared/bot'
import { PriorityBuilder } from '@/libs/shared/workflow'

import { createNeuroContainer } from './neuro.container'

export type NeuroControllerDeps = {
  cheeseBot: CheeseBot
  botBuilder: PriorityBuilder
}

export const configureNeuro =
  ({ cheeseBot, botBuilder }: NeuroControllerDeps) =>
  () => {
    const container = createNeuroContainer()

    botBuilder.add(() =>
      cheeseBot
        .useGeneratorCommand(
          DALLE_COMMAND,
          container.cradle.dalleUseCase,
          ({ strippedMessage }) => ({ prompt: strippedMessage }),
          {
            maxInProgress: 3,
          },
        )
        .useGeneratorCommand(
          RUGPT_COMMAND,
          container.cradle.ruGptUseCase,
          ({ strippedMessage }) => ({ prompt: strippedMessage }),
          {
            maxInProgress: 10,
          },
        ),
    )
  }
