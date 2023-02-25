import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'

import {
  RugptDeps,
  rugptUseCase,
  RugptUseCase,
  DalleDeps,
  DalleUseCase,
  dalleUseCase,
} from '@/libs/neuro/application'
import { LocaleStore } from '@/libs/shared/intl'
import { Logger, Semaphore } from '@/libs/shared/workflow'

import {
  DalleRepositoryDeps,
  RugptRepositoryDeps,
  requestRugptText,
  requestDalleMiniImages,
} from './repositories'

export type NeuroContainerItems = DalleDeps &
  RugptDeps &
  DalleRepositoryDeps &
  RugptRepositoryDeps & {
    dalleUseCase: DalleUseCase
    rugptUseCase: RugptUseCase
    localeStore: LocaleStore
  }

export type NeuroContainerConfig = {
  maxConcurrentDalleRequests: number
  maxConcurrentRugptRequests: number

  deps: {
    logger: Logger
    localeStore: LocaleStore
  }
}

export const createNeuroContainer = ({
  maxConcurrentDalleRequests,
  maxConcurrentRugptRequests,

  deps: { logger, localeStore },
}: NeuroContainerConfig) => {
  return createContainer<NeuroContainerItems>({
    injectionMode: InjectionMode.PROXY,
  }).register({
    requestDalleMiniImages: asFunction(requestDalleMiniImages).singleton(),
    requestRugptText: asFunction(requestRugptText).singleton(),
    dalleUseCase: asFunction(dalleUseCase).singleton(),
    rugptUseCase: asFunction(rugptUseCase).singleton(),
    dalleSemaphore: asFunction(
      () => new Semaphore(maxConcurrentDalleRequests),
    ).singleton(),
    rugptSemaphore: asFunction(
      () => new Semaphore(maxConcurrentRugptRequests),
    ).singleton(),
    logger: asValue(logger),
    localeStore: asValue(localeStore),
  })
}
