const ZERO_WIDTH_SPACE = '\u200c'

const escapeByZWSP = (c: string) => (str: string) => str.replaceAll(c, c + ZERO_WIDTH_SPACE)

export const escapeMention = (c: string) => ['@', '#', '*'].map(escapeByZWSP).reduce((acc, fn) => fn(acc), c)

export const escapeHtml = (str: string) =>
    str.replace(
        /[&<>'"]/g,
        (tag) => ({
            ['&']: '&amp;',
            ['<']: '&lt;',
            ['>']: '&gt;',
            ['"']: '&quot;',
            ['\'']: '&#39;',
        }[tag] ?? ''),
    )

export const escapeAll = (c: string) => [escapeMention, escapeHtml].reduce((acc, fn) => fn(acc), c)
