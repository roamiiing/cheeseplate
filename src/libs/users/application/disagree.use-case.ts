import { UseCase } from '@/libs/shared/workflow'
import { Chat, User } from '@prisma/client'

export const DISAGREE_COMMAND = '/disagree'

export type DisagreeDeps = {
  deleteUser: (
    userId: User['telegramId'],
    chatId: Chat['telegramId'],
  ) => Promise<{
    deleted: boolean
  }>
}

export type DisagreeInput = void

export const disagreeUseCase =
  ({ deleteUser }: DisagreeDeps): UseCase<DisagreeInput> =>
  async ({ userInfo: { userId }, chatInfo: { chatId } }) => {
    const { deleted } = await deleteUser(userId, chatId)

    if (!deleted) {
      return {
        message:
          'Ты еще не зарегистрирован. Если хочешь начать пользоваться ботом, пиши <pre>/agree</pre>',
      }
    }

    return {
      message: 'Ты больше не титан. Если передумаешь, пиши <pre>/agree</pre>',
    }
  }
