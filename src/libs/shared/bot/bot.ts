import { UseCase } from '@/libs/shared/workflow'

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

export interface CheeseBot {
  useCommand<Input>(
    command: string,
    useCase: UseCase<Input>,
    inputMapper?: InputMapper<Input>,
  ): CheeseBot
}
