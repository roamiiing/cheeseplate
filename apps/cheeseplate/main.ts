import { Bot } from 'grammy'
import { run } from 'grammy_runner'
import { error, info, setup } from 'std/log/mod.ts'
import { getEnv } from './env.ts'
import { createLogger } from './logger.ts'
import { createAppContainer } from './container.ts'
import { registerGeneralMiddlewares } from './middlewares.ts'

const { CHEESEPLATE_BOT_TOKEN, DENO_ENV } = await getEnv()

const logger = createLogger(DENO_ENV === 'production')

setup({
    handlers: {
        default: logger,
    },
})

const container = await createAppContainer(DENO_ENV === 'development')

const bot = new Bot(CHEESEPLATE_BOT_TOKEN)

const registerables = [
    registerGeneralMiddlewares,
    container.cradle.registerDalleHandler,
    container.cradle.registerBenHandler,
    container.cradle.registerRollHandler,
    container.cradle.registerPickHandler,
]

registerables.forEach((register) => register(bot))

bot.catch((err) => {
    error(err)
})

const handle = run(bot)

if (!handle.isRunning()) {
    error('Bot failed to start')
    Deno.exit()
}

info('Bot started')

const me = await bot.api.getMe()

info('Bot info', {
    id: me.id,
    username: me.username,
})
