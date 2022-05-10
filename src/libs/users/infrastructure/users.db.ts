import { PrismaClient } from '@prisma/client'
import {
  AboutDeps,
  AgreeDeps,
  DisagreeDeps,
  SetNameDeps,
} from '@/libs/users/application'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { Telegraf } from 'telegraf'

export type CrudDeps = {
  prismaClient: PrismaClient
  bot: Telegraf
}

export const insertUser =
  ({ prismaClient }: CrudDeps): AgreeDeps['insertUser'] =>
  async (telegramId, displayName, chatTelegramId) => {
    console.log('inserting')
    try {
      await prismaClient.user.create({
        data: {
          telegramId,
          displayName,
          chatTelegramId,
        },
      })
    } catch (e) {
      // unique constraint violation (already exists)
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        return {
          alreadyExists: true,
        }
      }
      throw e
    }

    return {
      alreadyExists: false,
    }
  }

export const deleteUser =
  ({ prismaClient }: CrudDeps): DisagreeDeps['deleteUser'] =>
  async (telegramId, chatTelegramId) => {
    try {
      await prismaClient.user.delete({
        where: {
          telegramId_chatTelegramId: {
            telegramId,
            chatTelegramId,
          },
        },
      })
    } catch (e) {
      // record to delete not found
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        return {
          deleted: false,
        }
      }

      throw e
    }

    return {
      deleted: true,
    }
  }

export const setUserName =
  ({ prismaClient }: CrudDeps): SetNameDeps['setUserName'] =>
  async (userId, displayName, chatId) => {
    try {
      await prismaClient.user.update({
        where: {
          telegramId_chatTelegramId: {
            telegramId: userId,
            chatTelegramId: chatId,
          },
        },
        data: {
          displayName,
        },
      })
    } catch (e) {
      // unique constraint violation (already exists)
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        return {
          alreadyExists: true,
        }
      }
      throw e
    }
    return { alreadyExists: false }
  }

export const getUserInfo =
  ({ prismaClient, bot }: CrudDeps): AboutDeps['getUserInfo'] =>
  async (userId, chatId) => {
    const user = await prismaClient.user.findUnique({
      where: {
        telegramId_chatTelegramId: {
          telegramId: userId,
          chatTelegramId: chatId,
        },
      },
      select: {
        displayName: true,
        telegramId: true,
        tags: {
          select: {
            tag: true,
          },
        },
      },
    })

    if (!user) return

    const { user: telegramUser } = await bot.telegram.getChatMember(
      Number(chatId),
      Number(userId),
    )

    return {
      displayName: user.displayName,
      id: user.telegramId,
      tags: user.tags.map(v => v.tag),
      username: telegramUser.username,
    }
  }

export const getUserInfoByDisplayName =
  ({ prismaClient, bot }: CrudDeps): AboutDeps['getUserInfoByDisplayName'] =>
  async (displayName, chatId) => {
    const user = await prismaClient.user.findUnique({
      where: {
        displayName_chatTelegramId: {
          chatTelegramId: chatId,
          displayName,
        },
      },
      select: {
        displayName: true,
        telegramId: true,
        tags: {
          select: {
            tag: true,
          },
        },
      },
    })

    if (!user) return

    const { user: telegramUser } = await bot.telegram.getChatMember(
      Number(chatId),
      Number(user.telegramId),
    )

    return {
      displayName: user.displayName,
      id: user.telegramId,
      tags: user.tags.map(v => v.tag),
      username: telegramUser.username,
    }
  }

export const getUserInfoByTelegramUsername =
  ({
    prismaClient,
    bot,
  }: CrudDeps): AboutDeps['getUserInfoByTelegramUsername'] =>
  async (username, chatId) => {
    const user = await prismaClient.user.findUnique({
      where: {
        telegramUsername_chatTelegramId: {
          chatTelegramId: chatId,
          telegramUsername: username,
        },
      },
      select: {
        displayName: true,
        telegramId: true,
        tags: {
          select: {
            tag: true,
          },
        },
      },
    })

    if (!user) return

    const { user: telegramUser } = await bot.telegram.getChatMember(
      Number(chatId),
      Number(user.telegramId),
    )

    return {
      displayName: user.displayName,
      id: user.telegramId,
      tags: user.tags.map(v => v.tag),
      username: telegramUser.username,
    }
  }
