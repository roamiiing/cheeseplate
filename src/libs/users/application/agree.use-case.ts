import { UseCase } from '@/libs/shared/workflow'
import { Chat, User } from '@prisma/client'

export const AGREE_COMMAND = '/agree'

export type AgreeDeps = {
  insertUser: (
    userId: User['telegramId'],
    displayName: User['displayName'],
    chatId: Chat['telegramId'],
  ) => Promise<{
    alreadyExists: boolean
  }>
}

export type AgreeInput = void

export const agreeUseCase =
  ({ insertUser }: AgreeDeps): UseCase<AgreeInput> =>
  async ({ userInfo: { userId, displayName }, chatInfo: { chatId } }) => {
    const { alreadyExists } = await insertUser(userId, displayName, chatId)

    if (alreadyExists) {
      return {
        message: 'Ты уже зарегистрирован. О всех командах - пиши /help',
      }
    }

    return {
      message:
        'Теперь ты титан и можешь пользоваться ботом! О всех командах - пиши /help',
    }
  }
