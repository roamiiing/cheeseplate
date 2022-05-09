import { UseCase } from '@/libs/shared/workflow'

export const ROLL_COMMAND = '/roll'

export type RollInput = {
  message?: string
}

export const rollUseCase =
  (): UseCase<RollInput> =>
  async ({ input: { message } }) => {
    console.log('ROlling')
    const prob = Math.round(Math.random() * 100)

    if (!message) return { message: `${prob}%` }

    return { message: `Вангую, что ${message} с вероятностью ${prob}%` }
  }
