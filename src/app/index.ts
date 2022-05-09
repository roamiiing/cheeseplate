import { config } from 'dotenv'

config()

import { bot } from './bot'

bot.launch()

console.log('Bot started')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
