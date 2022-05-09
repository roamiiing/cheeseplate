import { Context, Telegraf } from 'telegraf'
import {
  deleteTagForUsername,
  getUsernamesWithTags,
  setTagForUsername,
} from './db'

const { TG_BOT_TOKEN = '' } = process.env

const bot = new Telegraf(TG_BOT_TOKEN)

const TAG_SYMBOL = '*',
  ALLOWED_SYMBOLS = '[\\wа-я]',
  TAG_REGEX = new RegExp(`\\${TAG_SYMBOL}${ALLOWED_SYMBOLS}+`, 'gm'),
  ALLOWED_SYMBOLS_REGEX = new RegExp(`^${ALLOWED_SYMBOLS}+$`, 'gm')

const reply = (ctx: Context, message: string) =>
  ctx.replyWithHTML(message, {
    reply_to_message_id: ctx.message?.message_id,
  })

bot.command('/settag', async ctx => {
  const [, tag] = ctx.message.text.split(/\s/)

  if (!tag) {
    reply(ctx, 'А тег указать? <pre>/settag тег</pre>')
  }

  if (!tag.match(ALLOWED_SYMBOLS_REGEX)?.length) {
    return reply(
      ctx,
      'Неверный формат. Тег может содержать только латинские буквы, цифры и _',
    )
  }

  const { username } = ctx.message.from

  if (!username) {
    return reply(ctx, 'Странный чел, без ника...')
  }

  const { newlyInserted } = await setTagForUsername(username, tag)

  if (!newlyInserted) {
    return reply(ctx, `У тебя уже есть тег <b>${tag}</b>`)
  }

  return reply(ctx, `Теперь ты <s>титан</s> <b>${tag}</b>`)
})

bot.command('/deltag', async ctx => {
  const [, tag] = ctx.message.text.split(/\s/)

  if (!tag) {
    reply(ctx, 'А тег указать? <pre>/deltag тег</pre>')
  }

  if (!tag.match(ALLOWED_SYMBOLS_REGEX)?.length) {
    return reply(
      ctx,
      'Неверный формат. Тег может содержать только латинские буквы, цифры и _',
    )
  }

  const { username } = ctx.message.from

  if (!username) {
    return reply(ctx, 'Странный чел, без ника...')
  }

  const { deleted } = await deleteTagForUsername(username, tag)

  if (!deleted) {
    return reply(ctx, `У тебя нет тега <b>${tag}</b>`)
  }

  return reply(ctx, `Ты больше не <b>${tag}</b>`)
})

bot.on('text', async ctx => {
  const matches = [...ctx.message.text.matchAll(TAG_REGEX)]

  if (matches.length === 0) {
    return
  }

  const users = await getUsernamesWithTags(
    matches.map(v => v.toString().replace(TAG_SYMBOL, '')),
  )

  if (users.length === 0) {
    return
  }

  return reply(ctx, 'Призываю ' + users.map(v => `@${v}`).join(', '))
})

bot.catch((err, ctx) => {
  ctx.reply('Произошла ошиб очка')
})

export { bot }
