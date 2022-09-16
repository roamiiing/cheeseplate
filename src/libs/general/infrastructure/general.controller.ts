import os from 'os'

import { Telegraf } from 'telegraf'

import { HELP_COMMAND, DEBUG_COMMAND } from '@/libs/general/application'
import { CheeseBot } from '@/libs/shared/bot'
import { information, time } from '@/libs/shared/math'
import { Queue } from '@/libs/shared/queue'
import { wrapUseCase } from '@/libs/shared/telegraf'
import { PriorityBuilder } from '@/libs/shared/workflow'

import { createGeneralContainer } from './general.container'

export type GeneralControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
  cheeseBot: CheeseBot
  queue: Queue
}

export const configureGeneral =
  ({ cheeseBot, bot, botBuilder, queue }: GeneralControllerDeps) =>
  () => {
    const generalContainer = createGeneralContainer()

    botBuilder
      .add(() =>
        cheeseBot.useCommand(HELP_COMMAND, generalContainer.cradle.helpUseCase),
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
