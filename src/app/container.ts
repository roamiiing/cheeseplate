import { configureUsers } from '@/libs/users/infrastructure'
import { configureTags } from '@/libs/tags/infrastructure'
import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import { Telegraf } from 'telegraf'
import { bot } from './bot'

export const appContainer = createContainer<{
  bot: Telegraf
  prismaClient: PrismaClient
  configureUsers: ReturnType<typeof configureUsers>
  configureTags: ReturnType<typeof configureTags>
}>({
  injectionMode: InjectionMode.PROXY,
}).register({
  bot: asValue(bot),
  prismaClient: asValue(new PrismaClient()),
  configureUsers: asFunction(configureUsers),
  configureTags: asFunction(configureTags),
})
