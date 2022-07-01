import { asFunction, createContainer, InjectionMode } from 'awilix'
import { DalleDeps, dalleUseCase } from '@/libs/neuro/application'
import { requestDalleMiniImages } from './neuro.data'

export const createNeuroContainer = () => {
  return createContainer<
    DalleDeps & {
      dalleUseCase: ReturnType<typeof dalleUseCase>
    }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    requestDalleMiniImages: asFunction(requestDalleMiniImages),
    dalleUseCase: asFunction(dalleUseCase),
  })
}
