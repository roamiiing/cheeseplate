import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'

export const LIST_TAGS_COMMAND = '/taglist'

export type ListTagsDeps = {
  listTagsForUser: (
    userId: User['telegramId'],
    chatId: Chat['telegramId'],
  ) => Promise<Tag['tag'][]>
}

export type ListTagsInput = void

export const listTagsUseCase =
  ({ listTagsForUser }: ListTagsDeps): UseCase<ListTagsInput> =>
  async ({ userInfo: { userId }, chatInfo: { chatId } }) => {
    const tags = await listTagsForUser(userId, chatId)

    if (tags.length === 0) {
      return { message: 'У тебя нет тегов' }
    }

    return { message: `Твои теги: <b>${tags.join(', ')}</b>` }
  }
