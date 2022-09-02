import { PickChoicesArray } from '@/libs/random/domain'
import { getRandomFromArray, useRandomReplica } from '@/libs/shared/random'
import { mapZodError } from '@/libs/shared/validation'
import { UseCase } from '@/libs/shared/workflow'

export const PICK_COMMAND = '/pick'

export type PickInput = {
  choices: PickChoicesArray
}

const pickReplica = useRandomReplica({
  replicas: [
    'Я выбираю тебя, <s>пикачу</s> <b>%choice%</b> 🔮',
    'Из всего этого 💩, более-менее еще выглядит <b>%choice%</b>',
    'Хмм 🤔 Дай-ка подумать.. Пожалуй, <b>%choice%</b>',
    '<b>%choice%</b> - здесь лучший выбор 🎱',
    '🪑 Если бы это была загадка про два стула, я бы все равно выбрал <b>%choice%</b>',
    '✨ Звезды рекомендуют придерживаться <b>%choice%</b>',
  ],
  placeholders: ['choice'],
})

export const pickUseCase =
  (): UseCase<PickInput> =>
  async ({ input: { choices } }) => {
    const validated = await PickChoicesArray.safeParseAsync(choices)

    if (!validated.success) return { message: mapZodError(validated.error) }

    const choice = getRandomFromArray(validated.data)

    return {
      message: pickReplica({ choice }),
      options: {
        cleanupMessages: false,
      },
    }
  }
