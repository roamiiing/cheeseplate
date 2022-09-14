import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'

import { CheeseBot } from '@/libs/shared/bot'
import { Cache, PriorityBuilder } from '@/libs/shared/workflow'
import { SET_NAME_COMMAND, ABOUT_COMMAND } from '@/libs/users/application'

import { createUsersContainer } from './users.container'
import { toUpsertUser } from './users.mapper'

export type UsersControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient
  cheeseBot: CheeseBot
  cache: Cache
}

export const configureUsers =
  ({ bot, prismaClient, botBuilder, cheeseBot, cache }: UsersControllerDeps) =>
  () => {
    const usersContainer = createUsersContainer({
      prismaClient,
      bot,
      cache,
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
            const user = toUpsertUser(ctx.message)

            await usersContainer.cradle.upsertUserMiddleware(user)

            return next()
          }),
        {
          priority: 9,
        },
      )
  }
