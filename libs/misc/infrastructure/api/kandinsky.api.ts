import axios from 'axios'
import { decode as base64Decode } from 'std/encoding/base64.ts'
import { Buffer } from 'std/streams/buffer.ts'
import { info } from 'std/log/mod.ts'
import { createFakeHeaders } from 'shared/http'
import { ValueOf } from 'shared/di'
import { retryUntil } from 'shared/workflow'
import { KandinskyStyle } from 'misc/domain'
import { RequestKandinskyImagesInjection } from 'misc/application'

const { Values } = KandinskyStyle

const STYLE_TO_PROMPT: Record<KandinskyStyle, string> = {
    [Values['3d']]: 'RENDER',
    [Values.detailed]: 'DETAILED',
    [Values.aivazovsky]: 'AIVAZOVSKY',
    [Values.anime]: 'ANIME',
    [Values.cartoon]: 'CARTOON',
    [Values.christmas]: 'CHRISTMAS',
    [Values.classicism]: 'CLASSICISM',
    [Values.cyberpunk]: 'CYBERPUNK',
    [Values.digital]: 'DIGITAL',
    [Values.goncharova]: 'GONCHAROVA',
    [Values.iconography]: 'ICONOGRAPHY',
    [Values.kandinsky]: 'KANDINSKY',
    [Values.khokhloma]: 'KHOKHLOMA',
    [Values.malevich]: 'MALEVICH',
    [Values.medieval]: 'MEDIEVAL',
    [Values.mosaic]: 'MOSAIC',
    [Values.oil]: 'OIL',
    [Values.picasso]: 'PICASSO',
    [Values.pencil]: 'PENCIL',
    [Values.portrait]: 'PORTRAIT',
    [Values.renaissance]: 'RENAISSANCE',
    [Values.soviet]: 'SOVIET',
    [Values.studio]: 'STUDIO',
}

const TIMEOUT_MS = 60_000
const RETRY_PARAMS = {
    retries: 5,
    delayMs: 12_000,
}

const KANDINSKY_API_PREFIX = 'https://api.fusionbrain.ai/web/api/v1/text2image'

const KANDINSKY_RUN_API_URL = `${KANDINSKY_API_PREFIX}/run`

const FAKE_API_HEADERS = createFakeHeaders({
    origin: 'https://editor.fusionbrain.ai',
})

const REQUEST_PARAMS = {
    headers: FAKE_API_HEADERS,
    timeout: TIMEOUT_MS,
}

const getStatusUrl = (uuid: string) => `${KANDINSKY_API_PREFIX}/status/${uuid}`

type KandinskyInitialResponse = {
    status: Status.Initial
    uuid: string
}

type KandinskyDoneResponse = {
    status: Status.Done
    uuid: string
    images: string[] // base64
}

const enum Status {
    Initial = 'INITIAL',
    Done = 'DONE',
}

export class InvalidKandinskyResponseError extends Error {
    constructor(private _response: unknown) {
        super('Invalid Dalle response')
    }
}

export const requestKandinskyImages: ValueOf<RequestKandinskyImagesInjection> = async ({ prompt, style }) => {
    info('Requesting Kandinsky images for prompt', prompt)

    const jsonData = {
        type: 'GENERATE',
        style: style ? STYLE_TO_PROMPT[style] : 'DEFAULT',
        width: 1024,
        height: 1024,
        generateParams: {
            query: prompt,
        },
    }

    const formData = new FormData()
    const blob = new File([...JSON.stringify(jsonData)], 'blob', { type: 'application/json' })
    formData.append('params', blob)

    const { data: runResult } = await axios.post<KandinskyInitialResponse>(
        KANDINSKY_RUN_API_URL,
        formData,
        {
            headers: FAKE_API_HEADERS,
            timeout: TIMEOUT_MS,
            params: {
                model_id: '1',
            },
        },
    )

    if (runResult.status !== Status.Initial) throw new InvalidKandinskyResponseError(runResult)

    const { uuid } = runResult

    info('Received Kandinsky uuid', uuid)

    const { data: statusResult } = await retryUntil(
        () => axios.get<KandinskyDoneResponse>(getStatusUrl(uuid), REQUEST_PARAMS),
        ({ data }) => data.status === Status.Done,
        RETRY_PARAMS,
    )

    if (statusResult.status !== Status.Done || !Array.isArray(statusResult.images)) {
        throw new InvalidKandinskyResponseError(statusResult)
    }

    const { images } = statusResult

    info('Received Kandinsky images', images.length)

    return images.map((v) => new Buffer(base64Decode(v)))
}
