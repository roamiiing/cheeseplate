import { z } from 'zod'

export const DallePrompt = z
  .string({
    required_error: 'А текст написать? /dalle <b>ваш текст здесь</b>',
  })
  .min(2, 'Слишком мало текста, минимум 2 символа')
  .max(200, 'Слишком много текста, максимум 200 символов')
  .transform(val => val.replace(/\s/g, ' '))
  .brand('DallePrompt')

export type DallePrompt = z.infer<typeof DallePrompt>
