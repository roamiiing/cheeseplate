import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import { Telegraf } from 'telegraf'

import { Cache } from '@/libs/shared/workflow'
import {
  SetNameDeps,
  setNameUseCase,
  aboutUseCase,
  AboutDeps,
  upsertUserMiddleware,
  UpsertUserDeps,
} from '@/libs/users/application'

import {
  CrudDeps,
  getUserInfo,
  getUserInfoByDisplayName,
  getUserInfoByTelegramUsername,
  setUserName,
  upsertUser,
} from './users.repository'

export type UsersDeps = {
  prismaClient: PrismaClient
  bot: Telegraf
  cache: Cache
}

export const createUsersContainer = ({
  prismaClient,
  bot,
  cache,
}: UsersDeps) => {
  return createContainer<
    SetNameDeps &
      AboutDeps &
      UpsertUserDeps &
      CrudDeps & {
        setNameUseCase: ReturnType<typeof setNameUseCase>
        aboutUseCase: ReturnType<typeof aboutUseCase>
        upsertUserMiddleware: ReturnType<typeof upsertUserMiddleware>
      }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    prismaClient: asValue(prismaClient),
    bot: asValue(bot),
    cache: asValue(cache),

    setNameUseCase: asFunction(setNameUseCase),
    aboutUseCase: asFunction(aboutUseCase),
    upsertUserMiddleware: asFunction(upsertUserMiddleware),

    upsertUser: asFunction(upsertUser),
    setUserName: asFunction(setUserName),
    getUserInfo: asFunction(getUserInfo),
    getUserInfoByDisplayName: asFunction(getUserInfoByDisplayName),
    getUserInfoByTelegramUsername: asFunction(getUserInfoByTelegramUsername),
  })
}
