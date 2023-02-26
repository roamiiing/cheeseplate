import { z } from 'zod'

import { stripAfter } from '@/libs/shared/strings'

export const RugptPrompt = z
  .string({
    required_error: 'errors.prompt.required',
  })
  .min(1, 'errors.prompt.required')
  .max(500, 'errors.prompt.max')
  .transform(val => val.replace(/\s/g, ' '))
  .brand('RugptPrompt')

export type RugptPrompt = z.infer<typeof RugptPrompt>

const MAX_BALABOBA_RESULT_LENGTH = 500

export const postProcessRugptResult = (result: string) => {
  return stripAfter(result, MAX_BALABOBA_RESULT_LENGTH, true)
}
