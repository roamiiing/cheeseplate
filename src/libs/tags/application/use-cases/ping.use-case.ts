import { User, Tag, Chat } from '@prisma/client'

import { escapeHtml } from '@/libs/shared/strings'
import { UseCase } from '@/libs/shared/workflow'
import { ALL_TAG } from '@/libs/tags/domain'

import { drypingReplica, noSuchUsersReplica, pingReplica } from '../replicas'

export const DRY_PING_COMMAND = '/dryping'

export type PingDeps = {
  getUsersWithTags: (
    tags: Tag['tag'][],
    chatId: Chat['telegramId'],
    currentUserId?: User['id'],
  ) => Promise<Pick<User, 'telegramId' | 'displayName'>[]>
  getAllUsersInChat: (
    chatId: Chat['telegramId'],
    currentUserId?: User['id'],
  ) => Promise<Pick<User, 'telegramId' | 'displayName'>[]>
}

export type PingInput = {
  tags: Tag['tag'][]
  dry?: boolean
}

export const pingUseCase =
  ({ getUsersWithTags, getAllUsersInChat }: PingDeps): UseCase<PingInput> =>
  async ({
    chatInfo: { chatId },
    userInfo: { userId },
    input: { tags, dry = false },
  }) => {
    const users = await (tags.includes(ALL_TAG)
      ? getAllUsersInChat(chatId, !dry ? Number(userId) : undefined)
      : getUsersWithTags(tags, chatId, !dry ? Number(userId) : undefined))

    if (!dry) {
      if (users.length === 0) return

      return {
        message: pingReplica(
          {
            data: users
              .map(
                ({ displayName, telegramId }) =>
                  `<a href="tg://user?id=${telegramId}">${escapeHtml(
                    displayName,
                  )}</a>`,
              )
              .join(', '),
          },
          {
            escape: false,
          },
        ),
        options: {
          notify: true,
          cleanupMessages: false,
        },
      }
    }

    if (users.length === 0) return { message: noSuchUsersReplica() }

    return {
      message: drypingReplica({
        data: users.map(({ displayName }) => `${displayName}`).join(', '),
      }),
      options: {
        cleanupMessages: false,
      },
    }
  }
