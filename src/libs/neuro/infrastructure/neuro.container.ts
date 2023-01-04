import { asFunction, createContainer, InjectionMode } from 'awilix'

import { DalleDeps, DalleUseCase, dalleUseCase } from '@/libs/neuro/application'
import { Semaphore } from '@/libs/shared/workflow'

import { requestDalleMiniImages } from './neuro.repository'

export type NeuroContainerItems = DalleDeps & {
  dalleUseCase: DalleUseCase
}

export type NeuroContainerConfig = {
  maxConcurrentDalleRequests: number
}

export const createNeuroContainer = ({
  maxConcurrentDalleRequests,
}: NeuroContainerConfig) => {
  return createContainer<
    DalleDeps & {
      dalleUseCase: DalleUseCase
    }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    requestDalleMiniImages: asFunction(requestDalleMiniImages).singleton(),
    dalleUseCase: asFunction(dalleUseCase).singleton(),
    dalleSemaphore: asFunction(
      () => new Semaphore(maxConcurrentDalleRequests),
    ).singleton(),
  })
}
