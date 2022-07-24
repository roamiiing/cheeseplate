import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'
import { ALL_TAG } from '@/libs/tags/domain'
import { useRandomReplica } from '@/libs/shared/random'
import { useReplica } from '@/libs/shared/strings'

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

const drypingReplica = useRandomReplica({
  replicas: [
    'Эти великолепные люди получат уведомление 🗡: <b>%data%</b>',
    'Эта секта состоит из этих прекрасных человеков ⛪️: <b>%data%</b>',
    'Ну этих дурашек можно по пальцам пересчитать 🤯: <b>%data%</b>',
    'По этому тегу будут призваны 🪖: <b>%data%</b>',
    'Так ты можешь призвать их 😱: <b>%data%</b>',
    'Вот этот списочек будет пушнут 🤓: <b>%data%</b>',
  ],
  placeholders: ['data'],
})

const pingReplica = useRandomReplica({
  replicas: [
    '🪖 Призываю вас <b>%data%</b>',
    'Хаха, ну вот и до вас добрались, <b>%data%</b> 🚔',
    '<b>%data%</b>, вам пришло новое сообщение. Посмотри, вдруг там что-то важное 😉',
    'Рота подъем! <b>%data%</b> 🎖️',
    'Вас кто-то тегнул!!! <b>%data%</b> 😝',
    'АЛЯРМ! <b>%data%</b> 🚨',
    'console.warn("Vas tegnuli, <b>%data%</b> 🙈")',
  ],
  placeholders: ['data'],
})

const noSuchUsersReplica = useReplica({
  replica: 'Нет юзеров с такими тегами',
})

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
                  `<a href="tg://user?id=${telegramId}">${displayName}</a>`,
              )
              .join(', '),
          },
          {
            escape: false,
          },
        ),
        options: {
          notify: true,
        },
      }
    }

    if (users.length === 0) return { message: noSuchUsersReplica() }

    return {
      message: drypingReplica({
        data: users.map(({ displayName }) => `${displayName}`).join(', '),
      }),
    }
  }
