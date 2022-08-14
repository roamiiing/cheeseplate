import { PrismaClient } from '@prisma/client'
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'
import {
  setTagUseCase,
  SetTagDeps,
  listTagsUseCase,
  ListTagsDeps,
  deleteTagUseCase,
  DeleteTagDeps,
  pingUseCase,
  PingDeps,
} from '@/libs/tags/application'
import {
  CrudDeps,
  deleteTagForUser,
  getAllUsersInChat,
  getUsersWithTags,
  listTags,
  setTagForUser,
} from './tags.repository'

export type TagsDeps = {
  prismaClient: PrismaClient
}

export const createTagsContainer = ({ prismaClient }: TagsDeps) => {
  return createContainer<
    SetTagDeps &
      ListTagsDeps &
      DeleteTagDeps &
      PingDeps &
      CrudDeps & {
        setTagUseCase: ReturnType<typeof setTagUseCase>
        listTagsUseCase: ReturnType<typeof listTagsUseCase>
        deleteTagUseCase: ReturnType<typeof deleteTagUseCase>
        pingUseCase: ReturnType<typeof pingUseCase>
      }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    prismaClient: asValue(prismaClient),

    setTagUseCase: asFunction(setTagUseCase),
    listTags: asFunction(listTags),
    deleteTagForUser: asFunction(deleteTagForUser),
    getUsersWithTags: asFunction(getUsersWithTags),
    getAllUsersInChat: asFunction(getAllUsersInChat),

    setTagForUser: asFunction(setTagForUser),
    listTagsUseCase: asFunction(listTagsUseCase),
    deleteTagUseCase: asFunction(deleteTagUseCase),
    pingUseCase: asFunction(pingUseCase),
  })
}
