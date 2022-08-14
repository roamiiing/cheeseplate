import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import {
  SetNameDeps,
  setNameUseCase,
  aboutUseCase,
  AboutDeps,
} from '@/libs/users/application'
import {
  CrudDeps,
  getUserInfo,
  getUserInfoByDisplayName,
  getUserInfoByTelegramUsername,
  setUserName,
} from './users.repository'
import { Telegraf } from 'telegraf'

export type UsersDeps = {
  prismaClient: PrismaClient
  bot: Telegraf
}

export const createUsersContainer = ({ prismaClient, bot }: UsersDeps) => {
  return createContainer<
    SetNameDeps &
      AboutDeps &
      CrudDeps & {
        setNameUseCase: ReturnType<typeof setNameUseCase>
        aboutUseCase: ReturnType<typeof aboutUseCase>
      }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    prismaClient: asValue(prismaClient),
    bot: asValue(bot),

    setNameUseCase: asFunction(setNameUseCase),
    aboutUseCase: asFunction(aboutUseCase),

    setUserName: asFunction(setUserName),
    getUserInfo: asFunction(getUserInfo),
    getUserInfoByDisplayName: asFunction(getUserInfoByDisplayName),
    getUserInfoByTelegramUsername: asFunction(getUserInfoByTelegramUsername),
  })
}
