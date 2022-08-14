import { gcd } from '@/libs/shared/math'
import { UseCase } from '@/libs/shared/workflow'

import { rollReplica } from '../replicas'

export const ROLL_COMMAND = '/roll'

export type RollInput = {
  message?: string
}

export const rollUseCase =
  (): UseCase<RollInput> =>
  async ({ input: { message } }) => {
    const prob = Math.round(Math.random() * 100)

    const divider = gcd(prob, 100)
    const fraction = `${prob / divider} случаев из ${100 / divider}`

    if (!message) return { message: `${prob}%` }

    return {
      message: rollReplica({ message, prob: prob.toString(10), fraction }),
    }
  }
