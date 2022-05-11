import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'
import { ALL_TAG } from '@/libs/tags/domain'
import { useRandomReplica } from '@/libs/shared/random'

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

const drypingReplica = useRandomReplica({
  replicas: [
    'Эти долбаебы получат песды 🗡: <b>%data%</b>',
    'Эта долбаебская секта состоит из этих прекрасных человеков: <b>%data%</b>',
    'Ну этих ебланов можно по пальцам пересчитать: <b>%data%</b>',
    'По этому тегу будут призваны: <b>%data%</b>',
    'Так ты можешь призвать их: <b>%data%</b>',
    'Вот этот списочек будет пушнут: <b>%data%</b>',
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
    'АЛЯРМ БЛЯТЬ! <b>%data%</b> 🚨',
    'console.warn("Vas tegnuli, <b>%data%</b> 🙈")',
  ],
  placeholders: ['data'],
})

export const pingUseCase =
  ({ getUsersWithTags, getAllUsersInChat }: PingDeps): UseCase<PingInput> =>
  async ({ chatInfo: { chatId }, input: { tags, dry = false } }) => {
    const users = await (tags.includes(ALL_TAG)
      ? getAllUsersInChat(chatId)
      : getUsersWithTags(tags, chatId))

    if (!dry) {
      if (users.length === 0) return

      return {
        message: pingReplica({
          data: users
            .map(
              ({ displayName, telegramId }) =>
                `<a href="tg://user?id=${telegramId}">${displayName}</a>`,
            )
            .join(', '),
        }),
      }
    }

    if (users.length === 0) return { message: 'Нет юзеров с такими тегами' }

    return {
      message: drypingReplica({
        data: users.map(({ displayName }) => `${displayName}`).join(', '),
      }),
    }
  }
