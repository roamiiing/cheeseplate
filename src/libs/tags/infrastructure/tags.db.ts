import { PrismaClient } from '@prisma/client'
import {
  DeleteTagDeps,
  ListTagsDeps,
  PingDeps,
  SetTagDeps,
} from '@/libs/tags/application'

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
      .then(user => user?.tags.map(v => v.tag).includes(tag))

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
        tag,
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
        // tag,
        // users: {
        //   connect: {
        //     telegramId_chatTelegramId: {
        //       telegramId: userId,
        //       chatTelegramId: chatId,
        //     },
        //   },
        // },
      },
    })

    return { newlyInserted: true }
  }

export const getAllUsersInChat =
  ({ prismaClient }: CrudDeps): PingDeps['getAllUsersInChat'] =>
  async chatId => {
    const existing = await prismaClient.tag.findMany({
      select: {
        users: {
          select: {
            telegramId: true,
            displayName: true,
          },
        },
      },
      where: {
        chatTelegramId: chatId,
      },
    })

    if (!existing) return []

    return existing
      .map(v => v.users)
      .flat()
      .filter(
        (v, i, a) => a.findIndex(vv => vv.telegramId === v.telegramId) === i,
      )
  }

export const getUsersWithTags =
  ({ prismaClient }: CrudDeps): PingDeps['getUsersWithTags'] =>
  async (tags, chatId) => {
    const existing = await prismaClient.tag.findMany({
      select: {
        users: {
          select: {
            telegramId: true,
            displayName: true,
          },
        },
      },
      where: {
        tag: {
          in: tags,
        },
        chatTelegramId: chatId,
      },
    })

    if (!existing) return []

    return existing
      .map(v => v.users)
      .flat()
      .filter(
        (v, i, a) => a.findIndex(vv => vv.telegramId === v.telegramId) === i,
      )
  }

// export type SetTagForUsernameResult = {
//   newlyInserted: boolean
// }

// export const setTagForUsername =
//   ({ prismaClient }: CrudDeps) =>
//   async (username: string, tag: string): Promise<SetTagForUsernameResult> => {
//     const alreadyHas = await prismaClient.tag.findFirst({
//       where: {
//         tag,
//         usernames: {
//           has: username,
//         },
//       },
//     })

//     if (alreadyHas) {
//       return {
//         newlyInserted: false,
//       }
//     }

//     await prismaClient.tag.upsert({
//       where: {
//         tag,
//       },
//       update: {
//         usernames: {
//           push: username,
//         },
//       },
//       create: {
//         usernames: [username],
//         tag,
//       },
//     })

//     return {
//       newlyInserted: true,
//     }
//   }

// export type DeleteTagForUsernameResult = {
//   deleted: boolean
// }

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

    if (!user?.tags.find(v => v.tag === tag)) {
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
            .filter(v => v.tag !== tag)
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

export const listTagsForUser =
  ({ prismaClient }: CrudDeps): ListTagsDeps['listTagsForUser'] =>
  async (userId, chatId) => {
    const result = await prismaClient.user.findUnique({
      select: {
        tags: true,
      },
      where: {
        telegramId_chatTelegramId: {
          telegramId: userId,
          chatTelegramId: chatId,
        },
      },
    })

    if (!result) return []

    return result.tags.map(v => v.tag)
  }
