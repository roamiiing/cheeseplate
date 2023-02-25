import { flow } from 'fp-ts/function'

const ZERO_WIDTH_SPACE = '\u200c'

const escapeByZWSP = (c: string) => (str: string) =>
  str.replaceAll(c, c + ZERO_WIDTH_SPACE)

export const escapeMention = flow(
  escapeByZWSP('@'),
  escapeByZWSP('#'),
  escapeByZWSP('*'),
)

export const escapeHtml = (str: string) =>
  str.replace(
    /[&<>'"]/g,
    tag =>
      ({
        ['&']: '&amp;',
        ['<']: '&lt;',
        ['>']: '&gt;',
        ['"']: '&quot;',
        ["'"]: '&#39;',
      }[tag] ?? ''),
  )

export const escapeAll = flow(escapeMention, escapeHtml)
