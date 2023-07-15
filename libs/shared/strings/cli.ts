import { exists } from 'shared/guards'
import * as Re from './regex.ts'

export interface ParsedCliArgs extends Iterable<[string, string | boolean]> {
    readonly size: number

    /**
     * The part of the message that comes before the first argument.
     */
    readonly head: string

    getByAliases(...aliases: string[]): string | boolean | undefined
}

const CLI_ARG_NAME = Re.ALPHA_NUMERIC.oneOrMore()
const CLI_ARG_VALUE_SEPARATOR = Re.WHITESPACE.times(1, 3).or(Re.escape('=')).notEscaped()
const CLI_ARG_VALUE = Re.ALPHA_NUMERIC.zeroOrMore().then(Re.WORD_BOUNDARY)
const CLI_ARG_BOUNDARY = Re.anyOf(
    Re.escape('-').times(1, 2),
    Re.escape('—'),
    Re.escape('–'),
).notEscaped()

const CLI_ARG = Re.sequence(
    CLI_ARG_BOUNDARY,
    CLI_ARG_NAME,
    CLI_ARG_VALUE_SEPARATOR.then(CLI_ARG_VALUE).optional(),
)

const CLI_ARGS_HEAD = Re.sequence(
    Re.BEGIN,
    Re.ANYTHING.lazy().capture(),
    Re.WHITESPACE.oneOrMore(),
    CLI_ARG_BOUNDARY,
)

export const parseCliArgs = (message: string): ParsedCliArgs => {
    const args = new Map<string, string | boolean>()

    const head = CLI_ARGS_HEAD.toRegExp().exec(message)?.at(1)?.trim() ?? ''

    for (const match of message.matchAll(CLI_ARG.toRegExp('g'))) {
        const [key, value] = match[0].split(CLI_ARG_VALUE_SEPARATOR.toRegExp())

        const cleanKey = key.replace(
            CLI_ARG_BOUNDARY.toRegExp(),
            '',
        )

        const isBoolean = value === ''

        args.set(
            cleanKey,
            isBoolean || value,
        )
    }

    return {
        size: args.size,
        head,

        getByAliases(...aliases: string[]): string | boolean | undefined {
            for (const alias of aliases) {
                const value = args.get(alias)
                if (exists(value)) return value
            }

            return undefined
        },

        [Symbol.iterator](): Iterator<[string, string | boolean]> {
            return args.entries()
        },
    }
}
