import { gcd } from '@/libs/shared/math'

export type RollOutput = {
  parts: number
  of: number
  prob: number
}

export type RollUseCase = () => Promise<RollOutput>

export const rollUseCase = (): RollUseCase => async () => {
  const prob = Math.round(Math.random() * 100)

  const divider = gcd(prob, 100)

  const parts = prob / divider
  const of = 100 / divider

  return {
    prob,
    parts,
    of,
  }
}
