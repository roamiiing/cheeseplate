import { GeneratorUseCase, Media } from '@/libs/shared/workflow'
import { mapZodError } from '@/libs/shared/validation'
import { useRandomReplica } from '@/libs/shared/random'
import { DallePrompt } from '@/libs/neuro/domain'
import { Time } from '@/libs/shared/units'

export const DALLE_COMMAND = '/dalle'
export const DALLE_TIMEOUT = Time(4, 'm')

export type DalleDeps = {
  requestDalleMiniImages: (prompt: string) => Promise<Media[] | null>
}

export type DeleteTagInput = {
  prompt: string
}

const waitReplica = useRandomReplica({
  replicas: [
    'Секунд очку.. <i>%prompt%</i> уже на подходе ⏳',
    '<i>%prompt%</i>? А ты хорош) Ожидай 🤯',
  ],
  placeholders: ['prompt'],
})

const problemsReplica = useRandomReplica({
  replicas: [
    'Проблемы с Dalle, приходи позже 🥲',
    'Кажется Dalle умерла, подожди и попробуй еще раз 🤧',
  ],
  placeholders: [],
})

export const dalleUseCase = ({
  requestDalleMiniImages,
}: DalleDeps): GeneratorUseCase<DeleteTagInput> =>
  async function* dalleUseCase({ input: { prompt } }) {
    const validated = await DallePrompt.safeParseAsync(prompt)

    if (!validated.success) {
      return yield { message: mapZodError(validated.error) }
    }

    yield { message: waitReplica({ prompt: validated.data }) }

    const result = await requestDalleMiniImages(validated.data)

    if (!result) {
      return yield {
        message: problemsReplica({}),
      }
    }

    yield {
      media: result,
    }
  }
