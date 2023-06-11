import { Bot } from 'grammy'
import { getRandomFromArray } from 'shared/random'

const BEN_GIFS = [
    'https://c.tenor.com/eW6zRrKEuIYAAAAC/yes-ben.gif', // yes
    'https://c.tenor.com/DW_G9zcpdF4AAAAC/ben.gif', // no
    'https://c.tenor.com/Cziub06OwxgAAAAC/ben.gif', // hohoho
    'https://c.tenor.com/Vh28wO-oya4AAAAC/ugh-ben.gif', // ugh
    'https://c.tenor.com/hdPVLfpe81cAAAAC/talking-ben-drinking.gif', // drinking
]

const GIFS_PROBABILITIES = [0.47, 0.47, 0.02, 0.02, 0.02]

const getRandomBenGif = () => getRandomFromArray(BEN_GIFS, GIFS_PROBABILITIES)

export type RegisterBenHandler = (bot: Bot) => Bot

export const registerBenHandler: RegisterBenHandler = (bot: Bot) => {
    bot.command('ben', async (ctx) => {
        const gif = getRandomBenGif()

        await ctx.replyWithAnimation(gif!, {
            reply_to_message_id: ctx.message?.message_id,
            disable_notification: true,
        })
    })

    return bot
}
