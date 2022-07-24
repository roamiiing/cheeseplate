import { Telegraf } from 'telegraf'

import { PriorityBuilder } from '@/libs/shared/workflow'
import { PrismaClient } from '@prisma/client'

export type GeneralControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient
}

export const configureChats =
  ({ bot, botBuilder, prismaClient }: GeneralControllerDeps) =>
  () => {
    botBuilder.add(
      () =>
        bot.use(async (ctx, next) => {
          const chatId = ctx.message?.chat.id

          if (!chatId) return

          const exists = await prismaClient.chat.findUnique({
            where: {
              telegramId: chatId,
            },
          })

          if (exists) return next()
        }),
      {
        priority: 10,
      },
    )
  }
