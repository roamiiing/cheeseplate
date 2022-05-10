import { wrapUseCase } from '@/libs/shared/telegraf'
import { SET_NAME_COMMAND } from '@/libs/users/application'
import { PrismaClient } from '@prisma/client'
import { Telegraf } from 'telegraf'
import { ABOUT_COMMAND } from '../application/about.use-case'
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
      bot,
    })

    bot.command(ABOUT_COMMAND, async ctx => {
      // TODO: получать при помощи entity
      const [, displayName] = ctx.message.text.split(/\s+/)

      await wrapUseCase(ctx, usersContainer.cradle.aboutUseCase, {
        displayName,
      })
    })

    bot.command(SET_NAME_COMMAND, async ctx => {
      const [, displayName] = ctx.message.text.split(/\s+/)

      await wrapUseCase(ctx, usersContainer.cradle.setNameUseCase, {
        displayName,
      })
    })
  }
