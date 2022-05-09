import { wrapUseCase } from '@/libs/shared/telegraf'
import {
  AGREE_COMMAND,
  DISAGREE_COMMAND,
  SET_NAME_COMMAND,
} from '@/libs/users/application'
import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'
import { createUsersContainer } from './users.container'

export type UsersControllerDeps = {
  bot: Telegraf
  prismaClient: PrismaClient
}

export const configureUsers =
  ({ bot, prismaClient }: UsersControllerDeps) =>
  () => {
    const usersContainer = createUsersContainer({
      prismaClient,
    })()

    bot.command(AGREE_COMMAND, async ctx => {
      await wrapUseCase(ctx, usersContainer.cradle.agreeUseCase)
    })

    // TODO: вынести middlewares в соответствующие ограниченные контексты
    bot.use(async (ctx, next) => {
      const chatId = ctx.message!.chat.id
      const userId = ctx.message!.from.id

      const exists = await prismaClient.user.findUnique({
        where: {
          telegramId_chatTelegramId: {
            telegramId: userId,
            chatTelegramId: chatId,
          },
        },
      })

      if (exists) {
        return next()
      }
    })

    bot.command(DISAGREE_COMMAND, async ctx => {
      await wrapUseCase(ctx, usersContainer.cradle.disagreeUseCase)
    })

    bot.command(SET_NAME_COMMAND, async ctx => {
      const [, displayName] = ctx.message.text.split(/\s+/)

      await wrapUseCase(ctx, usersContainer.cradle.setNameUseCase, {
        displayName,
      })
    })
  }
