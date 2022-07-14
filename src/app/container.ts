import { PrismaClient } from '@prisma/client'
import {
  asFunction,
  asValue,
  asClass,
  createContainer,
  InjectionMode,
} from 'awilix'
import { Telegraf } from 'telegraf'

import { PriorityBuilder } from '@/libs/shared/workflow'
import { CheeseBot } from '@/libs/shared/bot'
import { configureUsers } from '@/libs/users/infrastructure'
import { configureTags } from '@/libs/tags/infrastructure'
import { configureRandom } from '@/libs/random/infrastructure'
import { configureGeneral } from '@/libs/general/infrastructure'
import { configureChats } from '@/libs/chats/infrastructure'
import { configureNeuro } from '@/libs/neuro/infrastructure'

import { TelegrafCheeseBot } from '@/libs/shared/telegraf'
import { Queue } from '@/libs/shared/queue'

import { bot, prismaClient, botBuilder } from './clients'

export const appContainer = createContainer<{
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient
  cheeseBot: CheeseBot
  queue: Queue

  configureChats: ReturnType<typeof configureChats>
  configureGeneral: ReturnType<typeof configureGeneral>
  configureUsers: ReturnType<typeof configureUsers>
  configureTags: ReturnType<typeof configureTags>
  configureRandom: ReturnType<typeof configureRandom>
  configureNeuro: ReturnType<typeof configureNeuro>
}>({
  injectionMode: InjectionMode.PROXY,
}).register({
  bot: asValue(bot),
  botBuilder: asValue(botBuilder),
  prismaClient: asValue(prismaClient),
  queue: asValue(new Queue()),

  cheeseBot: asClass(TelegrafCheeseBot),

  configureChats: asFunction(configureChats),
  configureGeneral: asFunction(configureGeneral),
  configureUsers: asFunction(configureUsers),
  configureTags: asFunction(configureTags),
  configureRandom: asFunction(configureRandom),
  configureNeuro: asFunction(configureNeuro),
})
