import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'

import {
  RugptDeps,
  rugptUseCase,
  RugptUseCase,
  DalleDeps,
  DalleUseCase,
  dalleUseCase,
} from '@/libs/neuro/application'
import { Logger, Semaphore } from '@/libs/shared/workflow'

import {
  NeuroRepositoryDeps,
  requestRugptText,
  requestDalleMiniImages,
} from './neuro.repository'

export type NeuroContainerItems = DalleDeps & {
  dalleUseCase: DalleUseCase
}

export type NeuroContainerConfig = {
  maxConcurrentDalleRequests: number
  maxConcurrentRugptRequests: number

  deps: {
    logger: Logger
  }
}

export const createNeuroContainer = ({
  maxConcurrentDalleRequests,
  maxConcurrentRugptRequests,

  deps: { logger },
}: NeuroContainerConfig) => {
  return createContainer<
    DalleDeps &
      RugptDeps &
      NeuroRepositoryDeps & {
        dalleUseCase: DalleUseCase
        rugptUseCase: RugptUseCase
      }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    requestDalleMiniImages: asFunction(requestDalleMiniImages).singleton(),
    requestRugptText: asFunction(requestRugptText).singleton(),
    dalleUseCase: asFunction(dalleUseCase).singleton(),
    rugptUseCase: asFunction(rugptUseCase).singleton(),
    dalleSemaphore: asFunction(() => new Semaphore(maxConcurrentDalleRequests)),
    rugptSemaphore: asFunction(
      () => new Semaphore(maxConcurrentRugptRequests),
    ).singleton(),
    logger: asValue(logger),
  })
}
