if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config()
}

import { Bot } from 'grammy'

const bot = new Bot(process.env.TG_BOT_TOKEN ?? '')

bot.command('start', ctx => ctx.reply('Hello World!'))

bot.start({
  drop_pending_updates: true,
})
