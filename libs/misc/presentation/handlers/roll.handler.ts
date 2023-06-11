import { Bot } from 'grammy'
import { LocaleStore } from 'shared/locales'
import { gcd } from 'shared/math'
import { stripFirst } from 'shared/strings'

export type RollHandlerDeps = {
    localeStore: LocaleStore
}

export type RegisterRollHandler = (bot: Bot) => Bot

export const registerRollHandler = ({
    localeStore,
}: RollHandlerDeps): RegisterRollHandler =>
(bot: Bot) => {
    bot.command('roll', async (ctx) => {
        const prob = Math.round(Math.random() * 100)

        const divider = gcd(prob, 100)
        const parts = {
            num: prob / divider,
            den: 100 / divider,
        }

        const message = stripFirst(ctx.message?.text ?? '')

        const reply = localeStore.get(
            message ? 'roll.prediction.full' : 'roll.prediction.empty',
            { prob, parts, message },
        )

        await ctx.reply(reply, {
            reply_to_message_id: ctx.message?.message_id,
            parse_mode: 'HTML',
        })
    })

    return bot
}
