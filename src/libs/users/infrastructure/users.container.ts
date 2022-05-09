import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import {
  AgreeDeps,
  agreeUseCase,
  DisagreeDeps,
  disagreeUseCase,
  SetNameDeps,
  setNameUseCase,
} from '@/libs/users/application'
import { CrudDeps, deleteUser, insertUser, setUserName } from './users.db'

export type UsersDeps = {
  prismaClient: PrismaClient
}

export const createUsersContainer =
  ({ prismaClient }: UsersDeps) =>
  () => {
    return createContainer<
      AgreeDeps &
        DisagreeDeps &
        SetNameDeps &
        CrudDeps & {
          agreeUseCase: ReturnType<typeof agreeUseCase>
          disagreeUseCase: ReturnType<typeof disagreeUseCase>
          setNameUseCase: ReturnType<typeof setNameUseCase>
        }
    >({
      injectionMode: InjectionMode.PROXY,
    }).register({
      prismaClient: asValue(prismaClient),

      agreeUseCase: asFunction(agreeUseCase),
      disagreeUseCase: asFunction(disagreeUseCase),
      setNameUseCase: asFunction(setNameUseCase),

      deleteUser: asFunction(deleteUser),
      insertUser: asFunction(insertUser),
      setUserName: asFunction(setUserName),
    })
  }
