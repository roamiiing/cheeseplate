import { GeneratorUseCase, Media } from '@/libs/shared/workflow'
import { mapZodError } from '@/libs/shared/validation'
import { useRandomReplica } from '@/libs/shared/random'
import { processRuGptResult, RuGptPrompt } from '@/libs/neuro/domain'
import { Time } from '@/libs/shared/units'
import { useReplica } from '@/libs/shared/strings'
import { pipe } from 'fp-ts/lib/function'

export const RUGPT_COMMAND = '/rugpt'
export const RUGPT_TIMEOUT = Time(4, 'm')

export type RuGptDeps = {
  requestRuGptText: (prompt: string) => Promise<string | null>
}

export type RuGptInput = {
  prompt: string
}

const waitReplica = useRandomReplica({
  replicas: [
    '<i>%prompt%</i>? Хм, ну посмотрим, что может <s>выср...</s> выдать ruGPT 😉',
    'Говорят что ruGPT может заместить целый штат редакторов в СМИ! 😱 Но давайте посмотрим, как он справится с <i>%prompt%</i>',
  ],
  placeholders: ['prompt'],
})

const problemsReplica = useRandomReplica({
  replicas: [
    'Как и большинство русских 🇷🇺 технологий (и не только), ruGPT не очень любит работать. Приходи позже(',
  ],
})

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

    yield { message: waitReplica({ prompt: validated.data }) }

    const result = await requestRuGptText(validated.data)

    if (!result) {
      return yield {
        message: problemsReplica({}),
      }
    }

    yield {
      message: resultReplica({ result: processRuGptResult(result) }),
    }
  }
