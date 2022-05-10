import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import {
  AgreeDeps,
  agreeUseCase,
  DisagreeDeps,
  disagreeUseCase,
  SetNameDeps,
  setNameUseCase,
  aboutUseCase,
  AboutDeps,
} from '@/libs/users/application'
import {
  CrudDeps,
  deleteUser,
  getUserInfo,
  getUserInfoByDisplayName,
  getUserInfoByTelegramUsername,
  insertUser,
  setUserName,
} from './users.db'
import { Telegraf } from 'telegraf'

export type UsersDeps = {
  prismaClient: PrismaClient
  bot: Telegraf
}

export const createUsersContainer = ({ prismaClient, bot }: UsersDeps) => {
  return createContainer<
    AgreeDeps &
      DisagreeDeps &
      SetNameDeps &
      AboutDeps &
      CrudDeps & {
        agreeUseCase: ReturnType<typeof agreeUseCase>
        disagreeUseCase: ReturnType<typeof disagreeUseCase>
        setNameUseCase: ReturnType<typeof setNameUseCase>
        aboutUseCase: ReturnType<typeof aboutUseCase>
      }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    prismaClient: asValue(prismaClient),
    bot: asValue(bot),

    agreeUseCase: asFunction(agreeUseCase),
    disagreeUseCase: asFunction(disagreeUseCase),
    setNameUseCase: asFunction(setNameUseCase),
    aboutUseCase: asFunction(aboutUseCase),

    deleteUser: asFunction(deleteUser),
    insertUser: asFunction(insertUser),
    setUserName: asFunction(setUserName),
    getUserInfo: asFunction(getUserInfo),
    getUserInfoByDisplayName: asFunction(getUserInfoByDisplayName),
    getUserInfoByTelegramUsername: asFunction(getUserInfoByTelegramUsername),
  })
}
