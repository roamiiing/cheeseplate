import { PrismaClient } from '@prisma/client'
import { AgreeDeps, DisagreeDeps, SetNameDeps } from '@/libs/users/application'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

export type CrudDeps = {
  prismaClient: PrismaClient
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
  }
