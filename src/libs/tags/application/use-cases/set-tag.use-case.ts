import { User, Tag, Chat } from '@prisma/client'

import { mapZodError } from '@/libs/shared/validation'
import { UseCase } from '@/libs/shared/workflow'
import { guardReservedTags, TagWithoutSymbol } from '@/libs/tags/domain'

import {
  alreadyHasTagReplica,
  reservedTagReplica,
  successfulySetReplica,
} from '../replicas'

export const SET_TAG_COMMAND = '/settag'

export type SetTagDeps = {
  setTagForUser: (
    userId: User['telegramId'],
    tag: Tag['tag'],
    chatId: Chat['telegramId'],
  ) => Promise<{
    newlyInserted: boolean
  }>
}

export type SetTagInput = {
  tag: Tag['tag']
}

export const setTagUseCase =
  ({ setTagForUser }: SetTagDeps): UseCase<SetTagInput> =>
  async ({ userInfo: { userId }, chatInfo: { chatId }, input: { tag } }) => {
    if (!tag) {
      return {
        message: 'А тег указать? <pre>/settag тег</pre>',
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
        message: reservedTagReplica(),
        options: {
          success: false,
        },
      }
    }

    const { newlyInserted } = await setTagForUser(
      userId,
      validated.data,
      chatId,
    )

    if (!newlyInserted) {
      return {
        message: alreadyHasTagReplica({ tag }),
        options: {
          success: false,
        },
      }
    }

    return {
      message: successfulySetReplica({
        tag,
      }),
    }
  }
