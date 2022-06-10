import { prisma, PrismaClient } from '@prisma/client'
import {
  DeleteTagDeps,
  ListTagsDeps,
  PingDeps,
  SetTagDeps,
} from '@/libs/tags/application'
import { compareDespiteCasing } from '@/libs/shared/strings'

export type CrudDeps = {
  prismaClient: PrismaClient
}

export const setTagForUser =
  ({ prismaClient }: CrudDeps): SetTagDeps['setTagForUser'] =>
  async (userId, tag, chatId) => {
    const alreadyHas = await prismaClient.user
      .findUnique({
        where: {
          telegramId_chatTelegramId: {
            telegramId: userId,
            chatTelegramId: chatId,
          },
        },
        select: {
          tags: {
            select: {
              tag: true,
            },
          },
        },
      })
      .then(user =>
        user?.tags.map(v => v.tag).find(v => compareDespiteCasing(tag, v)),
      )

    if (alreadyHas) {
      return {
        newlyInserted: false,
      }
    }

    await prismaClient.tag.upsert({
      where: {
        tag_chatTelegramId: {
          tag,
          chatTelegramId: chatId,
        },
      },
      update: {
        users: {
          connect: {
            telegramId_chatTelegramId: {
              telegramId: userId,
              chatTelegramId: chatId,
            },
          },
        },
      },
      create: {
        tag: tag.toLowerCase(),
        users: {
          connect: [
            {
              telegramId_chatTelegramId: {
                telegramId: userId,
                chatTelegramId: chatId,
              },
            },
          ],
        },
        chat: {
          connect: {
            telegramId: chatId,
          },
        },
      },
    })

    return { newlyInserted: true }
  }

export const getAllUsersInChat =
  ({ prismaClient }: CrudDeps): PingDeps['getAllUsersInChat'] =>
  (chatId, currentUserId) =>
    prismaClient.user.findMany({
      select: {
        telegramId: true,
        displayName: true,
      },
      where: {
        AND: {
          chatTelegramId: chatId,
          NOT: {
            telegramId: currentUserId,
          },
        },
      },
    })

export const getUsersWithTags =
  ({ prismaClient }: CrudDeps): PingDeps['getUsersWithTags'] =>
  (tags, chatId, currentUserId) =>
    prismaClient.user.findMany({
      select: {
        telegramId: true,
        displayName: true,
      },
      where: {
        tags: {
          some: {
            chatTelegramId: chatId,
            tag: {
              in: tags,
              mode: 'insensitive',
            },
          },
        },
        AND: {
          chatTelegramId: chatId,
          NOT: {
            telegramId: currentUserId,
          },
        },
      },
    })

export const deleteTagForUser =
  ({ prismaClient }: CrudDeps): DeleteTagDeps['deleteTagForUser'] =>
  async (userId, tag, chatId) => {
    const user = await prismaClient.user.findUnique({
      select: { tags: true },
      where: {
        telegramId_chatTelegramId: {
          telegramId: userId,
          chatTelegramId: chatId,
        },
      },
    })

    if (!user?.tags.find(v => compareDespiteCasing(v.tag, tag))) {
      return {
        deleted: false,
      }
    }

    await prismaClient.user.update({
      where: {
        telegramId_chatTelegramId: {
          telegramId: userId,
          chatTelegramId: chatId,
        },
      },
      data: {
        tags: {
          set: user.tags
            .filter(v => !compareDespiteCasing(v.tag, tag))
            .map(v => ({
              tag_chatTelegramId: {
                tag: v.tag,
                chatTelegramId: v.chatTelegramId,
              },
            })),
        },
      },
    })

    return {
      deleted: true,
    }
  }

export const listTags =
  ({ prismaClient }: CrudDeps): ListTagsDeps['listTags'] =>
  async chatId => {
    const result = await prismaClient.tag.findMany({
      select: {
        users: true,
        tag: true,
      },
      where: {
        chatTelegramId: chatId,
      },
    })

    return result.filter(v => v.users.length > 0).map(v => v.tag)
  }
