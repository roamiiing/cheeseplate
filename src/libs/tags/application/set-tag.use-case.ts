import { UseCase } from '@/libs/shared/workflow'
import { User, Tag, Chat } from '@prisma/client'
import { guardReservedTags, TagWithoutSymbol } from '@/libs/tags/domain'
import { mapZodError } from '@/libs/shared/validation'
import { useRandomReplica } from '@/libs/shared/random'
import { useReplica } from '@/libs/shared/strings'

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

const successfulySetReplica = useRandomReplica({
  replicas: [
    'Теперь ты <s>титан</s> <b>%tag%</b> 🗡',
    'Понял, записал вас в секту <b>%tag%</b> ✝️',
    'Променял клуб <s>рукожопов</s> на клуб <b>%tag%</b> 🍑',
    'Таким как ты я обычно советую выбрать верёвку и мыло, но, к сожалению, сегодня это <b>%tag%</b> 😭',
    '<b>%tag%</b>?! Это что-то новенькое 🤔',
    'Не знаю как ты, а я считаю что любить <b>%tag%</b> - опасно 😰',
    'Ого, ты теперь с <b>%tag%</b>, это так заводит 🥵🚙',
    'Эй, дружок-пирожок, тобой выбрана неправильная дверь, кружок любителей <b>%tag%</b> два блока вниз, впрочем, мне что-ли decide какие an*l slaves тебя на это вынудили 🤐',
  ],
  placeholders: ['tag'],
})

const reservedTagReplica = useReplica({
  replica: 'Это зарезервированный тег',
})

const alreadyHasTagReplica = useReplica({
  replica: 'У тебя уже есть тег %tag%',
  placeholders: ['tag'],
})

export const setTagUseCase =
  ({ setTagForUser }: SetTagDeps): UseCase<SetTagInput> =>
  async ({ userInfo: { userId }, chatInfo: { chatId }, input: { tag } }) => {
    if (!tag) {
      return { message: 'А тег указать? <pre>/settag тег</pre>' }
    }

    const validated = await TagWithoutSymbol.safeParseAsync(tag)

    if (!validated.success) {
      return { message: mapZodError(validated.error) }
    }

    if (!guardReservedTags(validated.data)) {
      return { message: reservedTagReplica() }
    }

    const { newlyInserted } = await setTagForUser(
      userId,
      validated.data,
      chatId,
    )

    if (!newlyInserted) {
      return { message: alreadyHasTagReplica({ tag }) }
    }

    return {
      message: successfulySetReplica({
        tag,
      }),
    }
  }
