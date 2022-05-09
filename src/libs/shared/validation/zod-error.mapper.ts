import { ZodError } from 'zod'

export const mapZodError = (err: ZodError) => {
  return err.errors.map(v => v.message).join('\n')
}
