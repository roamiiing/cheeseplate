import { ZodError } from 'zod'

export const mapZodError = (err: ZodError) =>
  err.errors.map(v => v.message).join('\n')
