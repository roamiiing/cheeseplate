import { Telegraf } from 'telegraf'

const { TG_BOT_TOKEN = '' } = process.env

export const bot = new Telegraf(TG_BOT_TOKEN)
