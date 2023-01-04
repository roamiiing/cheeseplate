import { z } from 'zod'

import { stripAfter } from '@/libs/shared/strings'

export const RugptPrompt = z
  .string({
    required_error: 'А текст написать? /rugpt <b>ваш текст здесь</b>',
  })
  .min(2, 'Слишком мало текста, минимум 2 символа')
  .max(200, 'Слишком много текста, максимум 200 символов')
  .transform(val => val.replace(/\s/g, ' '))
  .brand('RugptPrompt')

export type RugptPrompt = z.infer<typeof RugptPrompt>

const MAX_BALABOBA_RESULT_LENGTH = 500

export const postProcessRugptResult = (result: string) => {
  return stripAfter(result, MAX_BALABOBA_RESULT_LENGTH, true)
}
