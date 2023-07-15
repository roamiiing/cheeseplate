import { handlers } from 'std/log/mod.ts'
import { exists } from 'shared/guards'

const replacer = (key: string, value: unknown) => {
    if (key.toLocaleLowerCase().includes('stack')) return value

    const length = typeof value === 'object' && exists(value) && Object.keys(value).length

    if (length !== false && length > 500) {
        return `Struct with ${length} fields`
    }

    if (typeof value === 'string' && value.length > 500) {
        return `String with ${value.length} chars`
    }

    return value
}

const createDevLogger = () =>
    new handlers.ConsoleHandler('DEBUG', {
        formatter: (logRecord) => {
            const { msg, args, datetime } = logRecord
            const formattedArgs = args.map((arg) => JSON.stringify(arg, replacer)).join(' ')
            return `[${datetime.toLocaleTimeString('ru')}] ${msg} ${formattedArgs}`
        },
    })

const createProdLogger = () =>
    new handlers.ConsoleHandler('INFO', {
        formatter: (logRecord) => {
            const { msg, args, datetime, levelName } = logRecord
            const formattedArgs = args.map((arg) => JSON.stringify(arg, replacer)).join(' ')
            return `[${levelName}] [${datetime.toISOString()}] ${msg} ${formattedArgs}`
        },
    })

export const createLogger = (isProd: boolean) => isProd ? createProdLogger() : createDevLogger()
