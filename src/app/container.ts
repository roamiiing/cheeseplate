import { PrismaClient } from '@prisma/client'
import {
  asFunction,
  asValue,
  asClass,
  createContainer,
  InjectionMode,
} from 'awilix'
import { pipe } from 'fp-ts/function'
import { Telegraf } from 'telegraf'

import { configureChats } from '@/libs/chats/infrastructure'
import { configureGeneral } from '@/libs/general/infrastructure'
import { CheeseBot } from '@/libs/shared/bot'
import { CacheMemory } from '@/libs/shared/cache-memory'
import { Queue } from '@/libs/shared/queue'
import { TelegrafCheeseBot } from '@/libs/shared/telegraf'
import { Cache, PriorityBuilder } from '@/libs/shared/workflow'
import { configureTags } from '@/libs/tags/infrastructure'
import { configureUsers } from '@/libs/users/infrastructure'

import { bot, prismaClient, botBuilder } from './clients'
import { getModulesFromMask, Module } from './misc'

type ConfigureModulesDeps = {
  configureChats: ReturnType<typeof configureChats>
  configureGeneral: ReturnType<typeof configureGeneral>
  configureUsers: ReturnType<typeof configureUsers>
  configureTags: ReturnType<typeof configureTags>
}

const configureModules =
  ({
    configureChats,
    configureGeneral,
    configureUsers,
    configureTags,
  }: ConfigureModulesDeps) =>
  (
    featuresMask = Module.General | Module.Users | Module.Tags | Module.Random,
  ) => {
    // This one is always enabled for checking if chat is whitelisted
    configureChats()

    pipe(featuresMask, getModulesFromMask, modules =>
      modules.forEach(module =>
        ({
          [Module.General]: configureGeneral,
          [Module.Users]: configureUsers,
          [Module.Tags]: configureTags,
        }[module]()),
      ),
    )
  }

export const createAppContainer = () =>
  createContainer<
    {
      bot: Telegraf
      botBuilder: PriorityBuilder
      prismaClient: PrismaClient
      cheeseBot: CheeseBot
      queue: Queue
      cache: Cache
      configureModules: ReturnType<typeof configureModules>
    } & ConfigureModulesDeps
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    bot: asValue(bot),
    botBuilder: asValue(botBuilder),
    prismaClient: asValue(prismaClient),
    cache: asValue(new CacheMemory()),

    cheeseBot: asClass(TelegrafCheeseBot),

    configureChats: asFunction(configureChats),
    configureGeneral: asFunction(configureGeneral),
    configureUsers: asFunction(configureUsers),
    configureTags: asFunction(configureTags),

    configureModules: asFunction(configureModules),
  })
