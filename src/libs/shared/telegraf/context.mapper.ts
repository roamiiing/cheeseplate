import { Context } from 'telegraf'
import { UseCaseContext } from '../workflow/context'

export const mapContext =
  <Input>({ message, chat }: Context) =>
  (input: Input): UseCaseContext<Input> => ({
    userInfo: {
      userId: BigInt(message!.from.id),
      displayName: message!.from.username ?? message!.from.first_name,
    },
    chatInfo: {
      chatId: BigInt(message!.chat.id),
    },
    input,
  })
