import { asFunction, asValue, AwilixContainer, createContainer } from 'awilix'
import { FsLocaleStore, LocaleStore } from 'shared/locales'
import {
    RegisterBenHandler,
    registerBenHandler,
    RegisterDalleHandler,
    registerDalleHandler,
    RegisterPickHandler,
    registerPickHandler,
    RegisterRollHandler,
    registerRollHandler,
} from 'misc/presentation'
import { DalleDeps, DalleUseCase, dalleUseCase } from 'misc/application'
import { requestDalleMiniImages } from 'misc/infrastructure'
import { Semaphore } from 'shared/workflow'

const MAX_DALLE_CONCURRENCY = 10

export type AppContainer = {
    localeStore: LocaleStore

    dalleUseCase: DalleUseCase
    requestDalleMiniImages: DalleDeps['requestDalleMiniImages']
    dalleSemaphore: DalleDeps['dalleSemaphore']
    registerDalleHandler: RegisterDalleHandler

    registerBenHandler: RegisterBenHandler

    registerRollHandler: RegisterRollHandler

    registerPickHandler: RegisterPickHandler
}

export const createAppContainer = async (isDev = false): Promise<AwilixContainer<AppContainer>> => {
    const container = createContainer<AppContainer>()

    const localeStore = await FsLocaleStore.create('locales', isDev)

    container.register({
        localeStore: asValue(localeStore),

        dalleUseCase: asFunction(dalleUseCase).singleton(),
        requestDalleMiniImages: asValue(requestDalleMiniImages),
        dalleSemaphore: asValue(new Semaphore(MAX_DALLE_CONCURRENCY)),
        registerDalleHandler: asFunction(registerDalleHandler).singleton(),

        registerBenHandler: asValue(registerBenHandler),

        registerRollHandler: asFunction(registerRollHandler),

        registerPickHandler: asFunction(registerPickHandler),
    })

    return container
}
