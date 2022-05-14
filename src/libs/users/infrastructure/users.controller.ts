import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'

import { SET_NAME_COMMAND, ABOUT_COMMAND } from '@/libs/users/application'
import { wrapUseCase } from '@/libs/shared/telegraf'
import { PriorityBuilder } from '@/libs/shared/workflow'

import { createUsersContainer } from './users.container'

export type UsersControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient
}

export const configureUsers =
  ({ bot, prismaClient, botBuilder }: UsersControllerDeps) =>
  () => {
    const usersContainer = createUsersContainer({
      prismaClient,
      bot,
    })

    botBuilder
      .add(() =>
        bot.command(ABOUT_COMMAND, async ctx => {
          // TODO: получать при помощи entity
          const [, displayName] = ctx.message.text.split(/\s+/)

          await wrapUseCase(ctx, usersContainer.cradle.aboutUseCase, {
            displayName,
          })
        }),
      )
      .add(() =>
        bot.command(SET_NAME_COMMAND, async ctx => {
          const [, displayName] = ctx.message.text.split(/\s+/)

          await wrapUseCase(ctx, usersContainer.cradle.setNameUseCase, {
            displayName,
          })
        }),
      )
      .add(
        () =>
          bot.use(async (ctx, next) => {
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
          }),
        {
          priority: 9,
        },
      )
  }
