import { Message } from 'telegraf/typings/core/types/typegram'

import { UserToUpsert } from '@/libs/users/application'

export const toUpsertUser = (message?: Message): UserToUpsert | undefined => {
  if (!message || !message.from) return

  return {
    telegramId: BigInt(message.from.id),
    telegramUsername: message.from.username,
    firstName: message.from.first_name,
    chatTelegramId: message.chat.id,
  }
}
