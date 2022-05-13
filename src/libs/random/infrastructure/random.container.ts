import { asFunction, createContainer, InjectionMode } from 'awilix'
import { benUseCase, pickUseCase, rollUseCase } from '@/libs/random/application'

export const createTagsContainer = () => {
  return createContainer<{
    rollUseCase: ReturnType<typeof rollUseCase>
    benUseCase: ReturnType<typeof benUseCase>
    pickUseCase: ReturnType<typeof pickUseCase>
  }>({
    injectionMode: InjectionMode.PROXY,
  }).register({
    rollUseCase: asFunction(rollUseCase),
    benUseCase: asFunction(benUseCase),
    pickUseCase: asFunction(pickUseCase),
  })
}
