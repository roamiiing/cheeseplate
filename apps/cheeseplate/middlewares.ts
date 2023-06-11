import { Bot, Context, MiddlewareFn, Transformer } from 'grammy'
import { limit } from 'grammy_ratelimiter'
import { apiThrottler } from 'grammy_transformer_throttler'
import { autoRetry } from 'grammy_auto_retry'
import { info, warning } from 'std/log/mod.ts'
import { exists } from 'shared/guards'

const isBotHandledUpdate = (ctx: Context): boolean =>
    ctx.message?.text?.startsWith('/') ||
    ctx.message?.reply_to_message?.text?.startsWith('/') ||
    exists(ctx.callbackQuery?.data) ||
    ctx.message?.entities?.some((e) => e.type === 'hashtag') ||
    false

const loggingMiddleware: MiddlewareFn = async (ctx, next) => {
    const messageText = ctx.message?.text ?? ''

    if (messageText.startsWith('/') || messageText.includes('#')) {
        info('Chat event', ctx)
    }

    await next()
}

const loggingTransformer: Transformer = (call, method, payload, abort) => {
    info('Bot API usage', method, payload)

    return call(method, payload, abort)
}

export const registerGeneralMiddlewares = (bot: Bot): Bot => {
    bot
        .filter(isBotHandledUpdate)
        .use(loggingMiddleware)
        .use(limit({
            timeFrame: 2000,
            limit: 5,

            async onLimitExceeded(ctx) {
                warning('Limit exceeded', ctx)
                await ctx.reply('Slow down please!')
            },

            keyGenerator(ctx) {
                return [ctx.from?.id, ctx.chat?.id].join('#')
            },
        }))

    bot.api.deleteWebhook({
        drop_pending_updates: true,
    })

    bot.api.config
        .use(loggingTransformer)
        .use(apiThrottler())
        .use(autoRetry({
            maxRetryAttempts: 2,
            maxDelaySeconds: 40,
        }))

    return bot
}
