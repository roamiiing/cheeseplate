import { asFunction, createContainer, InjectionMode } from 'awilix'
import { benUseCase, rollUseCase } from '@/libs/random/application'

export const createTagsContainer = () => {
  return createContainer<{
    rollUseCase: ReturnType<typeof rollUseCase>
    benUseCase: ReturnType<typeof benUseCase>
  }>({
    injectionMode: InjectionMode.PROXY,
  }).register({
    rollUseCase: asFunction(rollUseCase),
    benUseCase: asFunction(benUseCase),
  })
}
