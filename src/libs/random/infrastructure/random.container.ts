import { asFunction, asValue, createContainer, InjectionMode } from 'awilix'

import { benUseCase, pickUseCase, rollUseCase } from '@/libs/random/application'
import { LocaleStore } from '@/libs/shared/intl'
import { Logger } from '@/libs/shared/workflow'

export type RandomContainerItems = {
  rollUseCase: ReturnType<typeof rollUseCase>
  benUseCase: ReturnType<typeof benUseCase>
  pickUseCase: ReturnType<typeof pickUseCase>
  localeStore: LocaleStore
  logger: Logger
}

export type RandomContainerConfig = {
  deps: {
    localeStore: LocaleStore
    logger: Logger
  }
}

export const createRandomContainer = ({
  deps: { localeStore, logger },
}: RandomContainerConfig) => {
  return createContainer<RandomContainerItems>({
    injectionMode: InjectionMode.PROXY,
  }).register({
    rollUseCase: asFunction(rollUseCase),
    benUseCase: asFunction(benUseCase),
    pickUseCase: asFunction(pickUseCase),
    localeStore: asValue(localeStore),
    logger: asValue(logger),
  })
}
