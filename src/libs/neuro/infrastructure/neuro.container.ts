import { asFunction, createContainer, InjectionMode } from 'awilix'

import {
  DalleDeps,
  dalleUseCase,
  RuGptDeps,
  ruGptUseCase,
} from '@/libs/neuro/application'

import { requestDalleMiniImages, requestRuGptText } from './neuro.data'

export const createNeuroContainer = () => {
  return createContainer<
    DalleDeps &
      RuGptDeps & {
        dalleUseCase: ReturnType<typeof dalleUseCase>
        ruGptUseCase: ReturnType<typeof ruGptUseCase>
      }
  >({
    injectionMode: InjectionMode.PROXY,
  }).register({
    requestDalleMiniImages: asFunction(requestDalleMiniImages),
    requestRuGptText: asFunction(requestRuGptText),
    dalleUseCase: asFunction(dalleUseCase),
    ruGptUseCase: asFunction(ruGptUseCase),
  })
}
