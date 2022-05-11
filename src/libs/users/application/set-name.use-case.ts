import { mapZodError } from '@/libs/shared/validation'
import { UseCase } from '@/libs/shared/workflow'
import { Chat, User } from '@prisma/client'
import { Username } from '@/libs/users/domain'
import { useRandomReplica } from '@/libs/shared/random'

export const SET_NAME_COMMAND = '/setname'

export type SetNameDeps = {
  setUserName: (
    userId: User['telegramId'],
    displayName: User['displayName'],
    chatId: Chat['telegramId'],
  ) => Promise<{
    alreadyExists: boolean
  }>
}

export type SetNameInput = {
  displayName: User['displayName']
}

const successfulChangeReplica = useRandomReplica({
  replicas: [
    'Теперь я буду звать вас %displayName%',
    'Какое красивое имя - %displayName%!',
    '%displayName%... А что, звучит со вкусом!',
    'мда... ты долго думал?..',
  ],
  placeholders: ['displayName'],
})

export const setNameUseCase =
  ({ setUserName }: SetNameDeps): UseCase<SetNameInput> =>
  async ({
    userInfo: { userId },
    chatInfo: { chatId },
    input: { displayName },
  }) => {
    const validated = await Username.safeParseAsync(displayName)

    if (!validated.success) {
      return {
        message: mapZodError(validated.error),
      }
    }

    const { alreadyExists } = await setUserName(userId, validated.data, chatId)

    if (alreadyExists)
      return { message: `Пользователь с именем ${displayName} уже есть` }

    return {
      message: successfulChangeReplica({
        displayName,
      }),
    }
  }
