import { asFunction, createContainer, InjectionMode } from 'awilix'

import { debugUseCase, helpUseCase } from '@/libs/general/application'

export const createGeneralContainer = () => {
  return createContainer<{
    helpUseCase: ReturnType<typeof helpUseCase>
    debugUseCase: ReturnType<typeof debugUseCase>
  }>({
    injectionMode: InjectionMode.PROXY,
  }).register({
    helpUseCase: asFunction(helpUseCase),
    debugUseCase: asFunction(debugUseCase),
  })
}
