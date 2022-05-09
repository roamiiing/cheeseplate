import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'
import { guardReservedTags, TagWithoutSymbol } from '@/libs/tags/domain'
import { mapZodError } from '@/libs/shared/validation'

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
      return { message: 'А тег указать? <pre>/settag тег</pre>' }
    }
    console.log(tag)

    const validated = await TagWithoutSymbol.safeParseAsync(tag)

    if (!validated.success) {
      return { message: mapZodError(validated.error) }
    }

    if (!guardReservedTags(validated.data)) {
      return { message: 'Это зарезервированный тег' }
    }

    const { newlyInserted } = await setTagForUser(
      userId,
      validated.data,
      chatId,
    )

    if (!newlyInserted) {
      return { message: `У тебя уже есть тег <b>${tag}</b>` }
    }

    return { message: `Теперь ты <s>титан</s> <b>${tag}</b>` }
  }
