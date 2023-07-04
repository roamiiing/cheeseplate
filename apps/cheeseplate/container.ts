import { asFunction, asValue, AwilixContainer, createContainer, Resolver } from 'awilix'
import { FsLocaleStore, LocaleStoreInjection } from 'shared/locales'
import {
    RegisterBenHandler,
    registerBenHandler,
    RegisterDalleHandler,
    registerDalleHandler,
    registerKandinskyHandler,
    RegisterPickHandler,
    registerPickHandler,
    RegisterRollHandler,
    registerRollHandler,
} from 'misc/presentation'
import {
    DalleDeps,
    DalleUseCase,
    dalleUseCase,
    KandinskySemaphoreInjection,
    kandinskyUseCase,
    KandinskyUseCaseInjection,
    RequestKandinskyImagesInjection,
} from 'misc/application'
import { requestDalleMiniImages, requestKandinskyImages } from 'misc/infrastructure'
import { Semaphore } from 'shared/workflow'

const MAX_DALLE_CONCURRENCY = 10
const MAX_KANDINSKY_CONCURRENCY = 10

export type AppContainer =
    & LocaleStoreInjection
    & RequestKandinskyImagesInjection
    & KandinskySemaphoreInjection
    & KandinskyUseCaseInjection
    & {
        dalleUseCase: DalleUseCase
        requestDalleMiniImages: DalleDeps['requestDalleMiniImages']
        dalleSemaphore: DalleDeps['dalleSemaphore']
        registerDalleHandler: RegisterDalleHandler

        registerBenHandler: RegisterBenHandler

        registerRollHandler: RegisterRollHandler

        registerPickHandler: RegisterPickHandler

        registerKandinskyHandler: RegisterPickHandler
    }

type StrictNameAndRegistrationPair<T> = {
    [U in keyof T]: Resolver<T[U]>
}

export const createAppContainer = async (isDev = false): Promise<AwilixContainer<AppContainer>> => {
    const container = createContainer<AppContainer>()

    const localeStore = await FsLocaleStore.create('locales', isDev)

    container.register(
        {
            localeStore: asValue(localeStore),

            dalleUseCase: asFunction(dalleUseCase).singleton(),
            requestDalleMiniImages: asValue(requestDalleMiniImages),
            dalleSemaphore: asValue(new Semaphore(MAX_DALLE_CONCURRENCY)),
            registerDalleHandler: asFunction(registerDalleHandler).singleton(),

            kandinskyUseCase: asFunction(kandinskyUseCase).singleton(),
            kandinskySemaphore: asValue(new Semaphore(MAX_KANDINSKY_CONCURRENCY)),
            requestKandinskyImages: asValue(requestKandinskyImages),

            registerBenHandler: asValue(registerBenHandler),

            registerRollHandler: asFunction(registerRollHandler),

            registerPickHandler: asFunction(registerPickHandler),

            registerKandinskyHandler: asFunction(registerKandinskyHandler),
        } satisfies StrictNameAndRegistrationPair<AppContainer>,
    )

    return container
}
