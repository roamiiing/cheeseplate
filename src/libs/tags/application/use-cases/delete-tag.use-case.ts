import { User, Tag, Chat } from '@prisma/client'

import { mapZodError } from '@/libs/shared/validation'
import { UseCase } from '@/libs/shared/workflow'
import { guardReservedTags, TagWithoutSymbol } from '@/libs/tags/domain'

import { hadNotThisTagReplica, successfullyRemoveReplica } from '../replicas'

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
      return {
        message: `А тег указать? <pre>${DELETE_TAG_COMMAND}</pre>`,
        options: {
          success: false,
        },
      }
    }

    const validated = await TagWithoutSymbol.safeParseAsync(tag)

    if (!validated.success) {
      return {
        message: mapZodError(validated.error),
        options: {
          success: false,
        },
      }
    }

    if (!guardReservedTags(validated.data)) {
      return {
        message: 'Это зарезервированный тег',
        options: {
          success: false,
        },
      }
    }

    const { deleted } = await deleteTagForUser(userId, validated.data, chatId)

    if (!deleted) {
      return {
        message: hadNotThisTagReplica({ tag }),
        options: {
          success: false,
        },
      }
    }

    return { message: successfullyRemoveReplica({ tag }) }
  }
