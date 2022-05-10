import { mapZodError } from '@/libs/shared/validation'
import { UseCase } from '@/libs/shared/workflow'
import { Chat, User } from '@prisma/client'
import { Username } from '@/libs/users/domain'

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
      message: `Теперь я буду звать вас ${displayName}`,
    }
  }
