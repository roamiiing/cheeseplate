import { GeneratorUseCase, Media } from '@/libs/shared/workflow'
import { mapZodError } from '@/libs/shared/validation'
import { DallePrompt } from '@/libs/neuro/domain'
import { Time } from '@/libs/shared/units'
import { problemsDalleReplica, waitDalleReplica } from '../replicas'

export const DALLE_COMMAND = '/dalle'
export const DALLE_TIMEOUT = Time(4, 'm')

export type DalleDeps = {
  requestDalleMiniImages: (prompt: string) => Promise<Media[] | null>
}

export type DeleteTagInput = {
  prompt: string
}

export const dalleUseCase = ({
  requestDalleMiniImages,
}: DalleDeps): GeneratorUseCase<DeleteTagInput> =>
  async function* dalleUseCase({ input: { prompt } }) {
    const validated = await DallePrompt.safeParseAsync(prompt)

    if (!validated.success) {
      return yield { message: mapZodError(validated.error) }
    }

    yield { message: waitDalleReplica({ prompt: validated.data }) }

    const result = await requestDalleMiniImages(validated.data)

    if (!result) {
      return yield {
        message: problemsDalleReplica(),
      }
    }

    yield {
      media: result,
    }
  }
