import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import { Telegraf } from 'telegraf'

import { PriorityBuilder } from '@/libs/shared/workflow'
import { CheeseBot } from '@/libs/shared/bot'
import { configureUsers } from '@/libs/users/infrastructure'
import { configureTags } from '@/libs/tags/infrastructure'
import { configureRandom } from '@/libs/random/infrastructure'
import { configureGeneral } from '@/libs/general/infrastructure'
import { configureChats } from '@/libs/chats/infrastructure'

import { bot, prismaClient, botBuilder, cheeseBot } from './clients'

export const appContainer = createContainer<{
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient
  cheeseBot: CheeseBot

  configureChats: ReturnType<typeof configureChats>
  configureGeneral: ReturnType<typeof configureGeneral>
  configureUsers: ReturnType<typeof configureUsers>
  configureTags: ReturnType<typeof configureTags>
  configureRandom: ReturnType<typeof configureRandom>
}>({
  injectionMode: InjectionMode.PROXY,
}).register({
  bot: asValue(bot),
  botBuilder: asValue(botBuilder),
  prismaClient: asValue(prismaClient),
  cheeseBot: asValue(cheeseBot),

  configureChats: asFunction(configureChats),
  configureGeneral: asFunction(configureGeneral),
  configureUsers: asFunction(configureUsers),
  configureTags: asFunction(configureTags),
  configureRandom: asFunction(configureRandom),
})
