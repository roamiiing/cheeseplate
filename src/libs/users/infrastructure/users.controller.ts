import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'

import { CheeseBot } from '@/libs/shared/bot'
import { PriorityBuilder } from '@/libs/shared/workflow'
import { SET_NAME_COMMAND, ABOUT_COMMAND } from '@/libs/users/application'

import { createUsersContainer } from './users.container'

export type UsersControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient
  cheeseBot: CheeseBot
}

export const configureUsers =
  ({ bot, prismaClient, botBuilder, cheeseBot }: UsersControllerDeps) =>
  () => {
    const usersContainer = createUsersContainer({
      prismaClient,
      bot,
    })

    botBuilder
      .add(() =>
        cheeseBot.useCommand(
          ABOUT_COMMAND,
          usersContainer.cradle.aboutUseCase,
          ({ strippedMessage }) => ({
            displayName: strippedMessage.split(/\s+/)[0],
          }),
        ),
      )
      .add(() =>
        cheeseBot.useCommand(
          SET_NAME_COMMAND,
          usersContainer.cradle.setNameUseCase,
          ({ strippedMessage }) => ({
            displayName: strippedMessage.split(/\s+/)[0],
          }),
        ),
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
