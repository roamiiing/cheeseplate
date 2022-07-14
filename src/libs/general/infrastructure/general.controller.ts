import { Telegraf } from 'telegraf'
import os from 'os'

import { wrapUseCase } from '@/libs/shared/telegraf'
import { PriorityBuilder } from '@/libs/shared/workflow'
import { HELP_COMMAND, DEBUG_COMMAND } from '@/libs/general/application'

import { createGeneralContainer } from './general.container'
import { PrismaClient } from '@prisma/client'
import { information, time } from '@/libs/shared/math'
import { Queue } from '@/libs/shared/queue'

export type GeneralControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  queue: Queue
}

export const configureGeneral =
  ({ bot, botBuilder, queue }: GeneralControllerDeps) =>
  () => {
    const generalContainer = createGeneralContainer()

    botBuilder
      .add(() =>
        bot.command(
          HELP_COMMAND,
          async ctx =>
            await wrapUseCase(ctx, generalContainer.cradle.helpUseCase, queue),
        ),
      )
      .add(
        () =>
          bot.command(DEBUG_COMMAND, async ctx => {
            const chatInfo = {
              id: ctx.chat.id,
              type: ctx.chat.type,
            }

            const serverInfo = {
              ram: {
                process: information(process.memoryUsage().rss, 'B'),
                total: information(os.totalmem(), 'B'),
              },
              uptime: time(Math.floor(process.uptime()), 's'),
            }

            await wrapUseCase(
              ctx,
              generalContainer.cradle.debugUseCase,
              queue,
              {
                chatInfo,
                serverInfo,
              },
            )
          }),
        {
          priority: 11,
        },
      )
  }
