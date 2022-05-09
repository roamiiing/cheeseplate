import { asFunction, createContainer, InjectionMode } from 'awilix'
import { rollUseCase } from '@/libs/random/application'

export const createTagsContainer = () => {
  return createContainer<{
    rollUseCase: ReturnType<typeof rollUseCase>
  }>({
    injectionMode: InjectionMode.PROXY,
  }).register({
    rollUseCase: asFunction(rollUseCase),
  })
}
