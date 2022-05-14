import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import { Telegraf } from 'telegraf'

import { configureUsers } from '@/libs/users/infrastructure'
import { configureTags } from '@/libs/tags/infrastructure'
import { configureRandom } from '@/libs/random/infrastructure'
import { PriorityBuilder } from '@/libs/shared/workflow'

import { bot, prismaClient, botBuilder } from './clients'
import { configureGeneral } from '@/libs/general/infrastructure'
import { configureChats } from '@/libs/chats/infrastructure'

export const appContainer = createContainer<{
  bot: Telegraf
  botBuilder: PriorityBuilder
  prismaClient: PrismaClient

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

  configureChats: asFunction(configureChats),
  configureGeneral: asFunction(configureGeneral),
  configureUsers: asFunction(configureUsers),
  configureTags: asFunction(configureTags),
  configureRandom: asFunction(configureRandom),
})
