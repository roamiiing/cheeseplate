import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'
import { guardReservedTags, TagWithoutSymbol } from '@/libs/tags/domain'
import { mapZodError } from '@/libs/shared/validation'
import { useRandomReplica } from '@/libs/shared/random'
import { useReplica } from '@/libs/shared/strings'

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

const successfullyRemoveReplica = useRandomReplica({
  replicas: [
    'Ты больше не <s>титан</s> <b>%tag%</b> 🕶',
    'Окей, с позором вышвыриваем из секты <b>%tag%</b> 🤬️',
    'Клуб <b>%tag%</b> сказал bye-bye? Не переживай, с клубом <s>рукожопов</s> ты всегда на своем месте 🤡',
    'Может после отказа от <b>%tag%</b>, ты всё-таки выберешь веревку, мыло, и старую табуретку?????? 🤪',
    'Ой, больно надо, чмоня. Как будто уж больно нужен <b>%tag%</b> 🤢',
    'Знаешь что делают на западе с теми, кто отказывается от <b>%tag%</b>? 🤐',
    'Нет слов, одни эмоции, <b>%tag%</b> покинул твой списочек 💅',
  ],
  placeholders: ['tag'],
})

const hadNotThisTagReplica = useReplica({
  replica: 'У тебя не было тега <b>%tag%</b>',
  placeholders: ['tag'],
})

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
      return { message: hadNotThisTagReplica({ tag }) }
    }

    return { message: successfullyRemoveReplica({ tag }) }
  }
