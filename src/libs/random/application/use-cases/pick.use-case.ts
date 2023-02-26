import { PickChoice, PickChoicesArray } from '@/libs/random/domain'
import { getRandomFromArray } from '@/libs/shared/random'

export type PickInput = {
  choices: PickChoicesArray
}

export type PickOutput = {
  choice: PickChoice
}

export type PickUseCase = (input: PickInput) => Promise<PickOutput>

export const pickUseCase =
  (): PickUseCase =>
  async ({ choices }) => {
    const choice = getRandomFromArray(choices)

    return {
      choice,
    }
  }
