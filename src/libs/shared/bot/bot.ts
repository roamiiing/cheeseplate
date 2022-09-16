import { GeneratorUseCase, UseCase } from '@/libs/shared/workflow'

export type InputMapper<Input> = (context: {
  /**
   * Message with command
   * @example /echo hello world
   */
  rawMessage: string

  /**
   * Message without command
   * @example hello world
   */
  strippedMessage: string
}) => Input

export type Options = {
  maxInProgress?: number
  handleAnalytics?: boolean
}

export interface CheeseBot {
  useCommand<Input>(
    command: string,
    useCase: UseCase<Input>,
    inputMapper?: InputMapper<Input>,
    options?: Options,
  ): CheeseBot

  useGeneratorCommand<Input>(
    command: string,
    useCase: GeneratorUseCase<Input>,
    inputMapper?: InputMapper<Input>,
    options?: Options,
  ): CheeseBot
}
