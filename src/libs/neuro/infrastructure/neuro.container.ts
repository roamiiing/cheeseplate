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
  })
}
