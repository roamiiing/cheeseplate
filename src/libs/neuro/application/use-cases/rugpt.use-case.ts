import { processRuGptResult, RuGptPrompt } from '@/libs/neuro/domain'
import { useReplica } from '@/libs/shared/strings'
import { Time } from '@/libs/shared/units'
import { mapZodError } from '@/libs/shared/validation'
import { GeneratorUseCase } from '@/libs/shared/workflow'

import { problemsGptReplica, waitGptReplica } from '../replicas'

export const RUGPT_COMMAND = '/rugpt'
export const RUGPT_TIMEOUT = Time(4, 'm')

export type RuGptDeps = {
  requestRuGptText: (prompt: string) => Promise<string | null>
}

export type RuGptInput = {
  prompt: string
}

const resultReplica = useReplica({
  replica: '%result%',
  placeholders: ['result'],
})

export const ruGptUseCase = ({
  requestRuGptText,
}: RuGptDeps): GeneratorUseCase<RuGptInput> =>
  async function* ruGptUseCase({ input: { prompt } }) {
    const validated = await RuGptPrompt.safeParseAsync(prompt)

    if (!validated.success) {
      return yield { message: mapZodError(validated.error) }
    }

    yield { message: waitGptReplica({ prompt: validated.data }) }

    const result = await requestRuGptText(validated.data)

    if (!result) {
      return yield {
        message: problemsGptReplica({}),
      }
    }

    yield {
      message: resultReplica({ result: processRuGptResult(result) }),
    }
  }
