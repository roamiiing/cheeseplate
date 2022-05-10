import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { Telegraf } from 'telegraf'
import commands from '../../../data/commands.json'

export type AdditionalCommandsDeps = {
  bot: Telegraf
  prismaClient: PrismaClient
}

export const configureAdditionalCommands =
  ({ bot, prismaClient }: AdditionalCommandsDeps) =>
  () => {
    bot.command('/help', ctx => {
      ctx.replyWithHTML(
        `
<b>Список доступных команд:</b>

${commands
  .map(
    cmd =>
      `- /${cmd.command}: ${cmd.description}${
        cmd.example ? ` (${cmd.example})` : ''
      }`,
  )
  .join('\n')}
      `,
      )
    })

    bot.command('/__debug', ctx => {
      ctx.replyWithHTML('<b>Инфа о чате</b>')
      ctx.replyWithHTML('<pre>' + JSON.stringify(ctx.chat, null, 2) + '</pre>')
    })

    // TODO: вынести middlewares в соответствующие ограниченные контексты
    bot.use(async (ctx, next) => {
      const chatId = ctx.message?.chat.id

      const exists = await prismaClient.chat.findUnique({
        where: {
          telegramId: chatId,
        },
      })

      if (exists) {
        if (ctx.message) {
          await prismaClient.user.upsert({
            where: {
              telegramId_chatTelegramId: {
                telegramId: ctx.message.from.id,
                chatTelegramId: ctx.message.chat.id,
              },
            },
            update: {
              telegramUsername: ctx.message.from.username,
            },
            create: {
              telegramId: ctx.message.from.id,
              chatTelegramId: ctx.message.chat.id,
              displayName:
                ctx.message.from.username ?? ctx.message.from.first_name,
            },
          })
        }

        return next()
      }
    })
  }
