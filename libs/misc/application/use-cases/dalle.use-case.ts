import { Buffer } from 'std/streams/mod.ts'
import { DallePrompt } from 'misc/domain'
import { Semaphore } from 'shared/workflow'

export type ImageBuffer = Buffer

export type DalleDeps = {
    requestDalleMiniImages: (prompt: string) => Promise<ImageBuffer[]>
    dalleSemaphore: Semaphore
}

export const enum DalleStatus {
    Wait,
    UnderLoad,
    Images,
}

export type DalleOutput =
    | { status: DalleStatus.Wait }
    | { status: DalleStatus.UnderLoad }
    | { status: DalleStatus.Images; images: readonly ImageBuffer[] }

export type DalleUseCase = (
    prompt: DallePrompt,
) => AsyncGenerator<DalleOutput, void, void>

export const dalleUseCase = ({
    requestDalleMiniImages,
    dalleSemaphore,
}: DalleDeps): DalleUseCase =>
    async function* dalleUseCase(prompt: DallePrompt) {
        const release = dalleSemaphore.acquire()

        if (!release) {
            return yield { status: DalleStatus.UnderLoad }
        }

        yield { status: DalleStatus.Wait }

        const images = await requestDalleMiniImages(prompt).finally(release)

        yield { status: DalleStatus.Images, images }
    }
