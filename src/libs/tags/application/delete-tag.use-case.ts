import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'
import { guardReservedTags, TagWithoutSymbol } from '@/libs/tags/domain'
import { mapZodError } from '@/libs/shared/validation'

export const DELETE_TAG_COMMAND = '/deltag'

export type DeleteTagDeps = {
  deleteTagForUser: (
    userId: User['telegramId'],
    tag: Tag['tag'],
    chatId: Chat['telegramId'],
  ) => Promise<{
    deleted: boolean
  }>
}

export type DeleteTagInput = {
  tag: Tag['tag']
}

export const deleteTagUseCase =
  ({ deleteTagForUser }: DeleteTagDeps): UseCase<DeleteTagInput> =>
  async ({ userInfo: { userId }, chatInfo: { chatId }, input: { tag } }) => {
    if (!tag) {
      return { message: `А тег указать? <pre>${DELETE_TAG_COMMAND}</pre>` }
    }

    const validated = await TagWithoutSymbol.safeParseAsync(tag)

    if (!validated.success) {
      return { message: mapZodError(validated.error) }
    }

    if (!guardReservedTags(validated.data)) {
      return { message: 'Это зарезервированный тег' }
    }

    const { deleted } = await deleteTagForUser(userId, validated.data, chatId)

    if (!deleted) {
      return { message: `У тебя не было тега <b>${tag}</b>` }
    }

    return { message: `Ты больше не <b>${tag}</b>` }
  }
