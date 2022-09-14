import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'

import { Time } from '@/libs/shared/units'
import { Cache, PriorityBuilder } from '@/libs/shared/workflow'

export type GeneralControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient
  cache: Cache
}

export const configureChats =
  ({ bot, botBuilder, prismaClient, cache }: GeneralControllerDeps) =>
  () => {
    // TODO: will be removed in CIRCLES-18
    const checkChatInWhitelist = cache.memoize(
      'checkChatInWhiteList',
      async (id: number) =>
        !!prismaClient.chat.findUnique({
          where: {
            telegramId: id,
          },
        }),
      {
        ttl: Time(1, 'h'),
      },
    )

    botBuilder.add(
      () =>
        bot.use(async (ctx, next) => {
          const chatId = ctx.message?.chat.id

          if (!chatId) return

          const exists = await checkChatInWhitelist(chatId)

          if (exists) return next()
        }),
      {
        priority: 10,
      },
    )
  }
