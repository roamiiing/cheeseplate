import { Bot } from 'grammy'
import { LocaleStore } from 'shared/locales'
import { stripFirst } from 'shared/strings'
import { mapLocalizedZodError } from 'shared/validation'
import { getRandomFromArray } from 'shared/random'
import { PickChoicesArray } from 'misc/domain'

export type PickHandlerDeps = {
    localeStore: LocaleStore
}

export type RegisterPickHandler = (bot: Bot) => Bot

export const registerPickHandler = ({
    localeStore,
}: PickHandlerDeps): RegisterPickHandler =>
(bot: Bot) => {
    bot.command('pick', async (ctx) => {
        const input = ctx.message?.text

        if (!input) {
            return await ctx.reply(
                localeStore.get('pick.errors.choices.required'),
                {
                    disable_notification: true,
                    parse_mode: 'HTML',
                },
            )
        }

        const strippedMessage = stripFirst(input)

        const choices = strippedMessage
            .split(/\n/.test(strippedMessage) ? '\n' : ',')
            .map((v) => v.trim())
            .filter((v) => !!v)

        const validated = await PickChoicesArray.safeParseAsync(choices)

        if (!validated.success) {
            return await ctx.reply(mapLocalizedZodError(localeStore)(validated.error), {
                disable_notification: true,
                parse_mode: 'HTML',
            })
        }

        const choice = getRandomFromArray(choices)!

        return await ctx.reply(localeStore.get('pick.choice', { choice }), {
            parse_mode: 'HTML',
            disable_notification: true,
        })
    })

    return bot
}
