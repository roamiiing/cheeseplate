import { stripAfter } from '@/libs/shared/strings'
import { pipe } from 'fp-ts/lib/function'

const RUGPT_MAX_LENGTH = 140

export const processRuGptResult = (result: string) => {
  const stripped = stripAfter(result, RUGPT_MAX_LENGTH, true)

  // also remove comma and such characters from the end
  const removed = stripped.replace(/([^?!.)}\]"'`])$/, '')

  return removed
}
