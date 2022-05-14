import { Telegraf } from 'telegraf'
import os from 'os'

import { wrapUseCase } from '@/libs/shared/telegraf'
import { PriorityBuilder } from '@/libs/shared/workflow'
import { HELP_COMMAND, DEBUG_COMMAND } from '@/libs/general/application'

import { createGeneralContainer } from './general.container'
import { PrismaClient } from '@prisma/client'
import { information, time } from '@/libs/shared/math'

export type GeneralControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
}

export const configureGeneral =
  ({ bot, botBuilder }: GeneralControllerDeps) =>
  () => {
    const generalContainer = createGeneralContainer()

    botBuilder
      .add(() =>
        bot.command(
          HELP_COMMAND,
          async ctx =>
            await wrapUseCase(ctx, generalContainer.cradle.helpUseCase),
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
                process: information(process.memoryUsage().heapTotal, 'B'),
                total: information(os.totalmem(), 'B'),
              },
              uptime: time(process.uptime(), 'ms'),
            }

            await wrapUseCase(ctx, generalContainer.cradle.debugUseCase, {
              chatInfo,
              serverInfo,
            })
          }),
        {
          priority: 11,
        },
      )
  }
