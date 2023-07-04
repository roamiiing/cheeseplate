import { Buffer } from 'std/streams/mod.ts'
import { KandinskyInput } from 'misc/domain'
import { Semaphore } from 'shared/workflow'
import { Injection } from 'shared/di'

export type RequestKandinskyImagesInjection = Injection<
    'requestKandinskyImages',
    (input: KandinskyInput) => Promise<Buffer[]>
>

export type KandinskySemaphoreInjection = Injection<
    'kandinskySemaphore',
    Semaphore
>

export type KandinskyDeps =
    & RequestKandinskyImagesInjection
    & KandinskySemaphoreInjection

export const enum KandinskyStatus {
    AskForStyles,
    Wait,
    UnderLoad,
    Images,
}

export type KandinskyOutput =
    // | { status: KandinskyStatus.AskForStyles } // идея запросить стиль в виде инлайн-клавиатуры
    | { status: KandinskyStatus.Wait }
    | { status: KandinskyStatus.UnderLoad }
    | { status: KandinskyStatus.Images; images: readonly Buffer[] }

export type KandinskyUseCase = (input: KandinskyInput) => AsyncGenerator<KandinskyOutput, void, void>

export type KandinskyUseCaseInjection = Injection<
    'kandinskyUseCase',
    KandinskyUseCase
>

export const kandinskyUseCase = ({
    requestKandinskyImages,
    kandinskySemaphore,
}: KandinskyDeps): KandinskyUseCase =>
    async function* kandinskyUseCase({ style, prompt }) {
        const release = kandinskySemaphore.acquire()

        if (!release) {
            return yield { status: KandinskyStatus.UnderLoad }
        }

        yield { status: KandinskyStatus.Wait }

        const images = await requestKandinskyImages({ style, prompt }).finally(release)

        yield { status: KandinskyStatus.Images, images }
    }
