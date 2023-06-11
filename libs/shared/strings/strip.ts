/**
 * Removes the first word from the given string
 */
export const stripFirst = (str: string) => {
    if (str.split(/\s+/).length <= 1) return ''
    return str.replace(/^\S+\s+/, '').trim()
}

/**
 * Removes all charactes after `symbolCount` without
 * cutting the last word (if `saveLastWord` is set to `true`)
 */
export const stripAfter = (
    str: string,
    symbolsCount = 140,
    saveLastWord = false,
) => new RegExp(`^(.{0,${symbolsCount}}${saveLastWord ? '\\S*' : ''})`, 's')
    .exec(str)
    ?.at(0) ?? ''
