import { exists } from 'shared/guards'

class RegexPart {
    readonly #source: string

    static of(source: string): RegexPart {
        return new RegexPart(source)
    }

    private constructor(part: string) {
        this.#source = part
    }

    get source(): string {
        return this.#source
    }

    times(min: number, max?: number): RegexPart {
        return times(this, min, max)
    }

    optional(): RegexPart {
        return optional(this)
    }

    oneOrMore(): RegexPart {
        return oneOrMore(this)
    }

    zeroOrMore(): RegexPart {
        return zeroOrMore(this)
    }

    lazy(): RegexPart {
        return lazy(this)
    }

    not(): RegexPart {
        return not(this)
    }

    notEscaped(): RegexPart {
        return notEscaped(this)
    }

    capture(): RegexPart {
        return capturingGroup(this)
    }

    nonCapture(): RegexPart {
        return nonCapturingGroup(this)
    }

    then(part: RegexPart) {
        return sequence(this, part)
    }

    or(part: RegexPart) {
        return anyOf(this, part)
    }

    toRegExp(flags?: string): RegExp {
        return new RegExp(this.#source, flags)
    }
}

export const raw = (str: string): RegexPart => RegexPart.of(str)

export const escape = (str: string): RegexPart => raw(str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))

export const nonCapturingGroup = (part: RegexPart): RegexPart => raw(`(?:${part.source})`)

export const capturingGroup = (part: RegexPart): RegexPart => raw(`(${part.source})`)

export const oneOrMore = (part: RegexPart): RegexPart => raw(`${nonCapturingGroup(part).source}+`)

export const zeroOrMore = (part: RegexPart): RegexPart => raw(`${nonCapturingGroup(part).source}*`)

export const anyOf = (...parts: RegexPart[]): RegexPart =>
    nonCapturingGroup(raw(`${parts.map((part) => part.source).join('|')}`))

export const sequence = (...parts: RegexPart[]): RegexPart => raw(parts.map((part) => part.source).join(''))

export const optional = (part: RegexPart): RegexPart => raw(`${nonCapturingGroup(part).source}?`)

export const lazy = (part: RegexPart): RegexPart => raw(`${nonCapturingGroup(part).source}*?`)

export const times = (part: RegexPart, min: number, max?: number): RegexPart =>
    raw(`${nonCapturingGroup(part).source}{${min},${exists(max) ? max : ''}}`)

export const not = (part: RegexPart): RegexPart => raw(`(?!${part.source})`)

export const notEscaped = (part: RegexPart) => sequence(not(escape('\\')), part)

export const ANYTHING = raw('.')

export const NOTHING = raw('')

export const WORD_BOUNDARY = raw('\\b')

export const WHITESPACE = raw('\\s')

export const ALPHA_NUMERIC = raw('\\w')

export const NON_ALPHA_NUMERIC = raw('\\W')

export const DIGIT = raw('\\d')

export const NON_DIGIT = raw('\\D')

export const BEGIN = raw('^')

export const END = raw('$')
