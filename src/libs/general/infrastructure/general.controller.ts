import os from 'os'

import { Telegraf } from 'telegraf'

import { HELP_COMMAND, DEBUG_COMMAND } from '@/libs/general/application'
import { information, time } from '@/libs/shared/math'
import { Queue } from '@/libs/shared/queue'
import { wrapUseCase } from '@/libs/shared/telegraf'
import { PriorityBuilder } from '@/libs/shared/workflow'
import { Cache } from '@/libs/shared/workflow'

import { createGeneralContainer } from './general.container'

export type GeneralControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  queue: Queue
  cache: Cache
}

export const configureGeneral =
  ({ bot, botBuilder, queue, cache }: GeneralControllerDeps) =>
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

            const cacheInfo = await cache.getDebugInfo()

            await wrapUseCase(
              ctx,
              generalContainer.cradle.debugUseCase,
              queue,
              {
                chatInfo,
                serverInfo,
                cacheInfo,
              },
            )
          }),
        {
          priority: 11,
        },
      )
  }
