import { z } from 'zod'

export const DallePrompt = z
  .string({
    required_error: 'dalle.errors.prompt.required',
  })
  .min(1, 'dalle.errors.prompt.required')
  .max(500, 'dalle.errors.prompt.max')
  .transform(val => val.replace(/\s/g, ' '))
  .brand('DallePrompt')

export type DallePrompt = z.infer<typeof DallePrompt>
