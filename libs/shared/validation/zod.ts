import { ZodError } from 'zod'
import { LocaleStore } from 'shared/locales'

export const mapZodError = (err: ZodError) => err.errors.map((v) => v.message).join('\n')

export const mapLocalizedZodError = (t: LocaleStore) => (err: ZodError) =>
    err.errors.map((v) => t.get(v.message, {})).join('\n')
