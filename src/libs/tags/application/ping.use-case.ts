import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'
import { ALL_TAG } from '@/libs/tags/domain'

export const DRY_PING_COMMAND = '/dryping'

export type PingDeps = {
  getUsersWithTags: (
    tags: Tag['tag'][],
    chatId: Chat['telegramId'],
  ) => Promise<Pick<User, 'telegramId' | 'displayName'>[]>
  getAllUsersInChat: (
    chatId: Chat['telegramId'],
  ) => Promise<Pick<User, 'telegramId' | 'displayName'>[]>
}

export type PingInput = {
  tags: Tag['tag'][]
  dry?: boolean
}

export const pingUseCase =
  ({ getUsersWithTags, getAllUsersInChat }: PingDeps): UseCase<PingInput> =>
  async ({ chatInfo: { chatId }, input: { tags, dry = false } }) => {
    const users = await (tags.includes(ALL_TAG)
      ? getAllUsersInChat(chatId)
      : getUsersWithTags(tags, chatId))

    if (!dry) {
      if (users.length === 0) return

      return {
        message: `Призываю вас, ${users
          .map(
            ({ displayName, telegramId }) =>
              `<a href="tg://user?id=${telegramId}">${displayName}</a>`,
          )
          .join(', ')}`,
      }
    }

    if (users.length === 0) return { message: 'Нет юзеров с такими тегами' }

    return {
      message: `Будут призваны следующие юзеры: ${users
        .map(({ displayName }) => `${displayName}`)
        .join(', ')}`,
    }
  }
