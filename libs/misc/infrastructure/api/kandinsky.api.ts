import axios from 'axios'
import { decode as base64Decode } from 'std/encoding/base64.ts'
import { Buffer } from 'std/streams/buffer.ts'
import { error, info } from 'std/log/mod.ts'
import { createFakeHeaders, jsonToFormData } from 'shared/http'
import { ValueOf } from 'shared/di'
import { retryUntil } from 'shared/workflow'
import { KandinskyStyle } from 'misc/domain'
import { RequestKandinskyImagesInjection } from 'misc/application'

const { Values } = KandinskyStyle

const STYLE_TO_PROMPT: Record<KandinskyStyle, string> = {
    [Values['3d']]: 'Unreal Engine rendering, 3d render, photorealistic, digital concept art, octane render, 4k HD',
    [Values.detailed]: '4k, ultra HD, detailed phot',
    [Values.aivazovsky]: 'painted by Aivazovsky',
    [Values.anime]: 'in anime style',
    [Values.cartoon]: 'as cartoon, picture from cartoon',
    [Values.christmas]: 'christmas, winter, x-mas, decorations, new year eve, snowflakes, 4k',
    [Values.classicism]: 'classicism painting, 17th century, trending on artstation, baroque painting',
    [Values.cyberpunk]: 'in cyberpunk style, futuristic cyberpunk',
    [Values.digital]:
        'high quality, highly detailed, concept art, digital painting, by greg rutkowski trending on artstation',
    [Values.goncharova]: 'painted by Goncharova, Russian avant-garde, futurism, cubism, suprematism',
    [Values.iconography]: 'in the style of a wooden christian medieval icon in the church',
    [Values.kandinsky]: 'painted by Vasily Kandinsky, abstractionis',
    [Values.khokhloma]: 'in Russian style, Khokhloma, 16th century, marble, decorative, realistic',
    [Values.malevich]:
        'Malevich, suprematism, avant-garde art, 20th century, geometric shapes , colorful, Russian avant-garde',
    [Values.medieval]: 'medieval painting, 15th century, trending on artstation',
    [Values.mosaic]: 'as tile mosaic',
    [Values.oil]: 'like oil painting',
    [Values.picasso]: 'Cubist painting by Pablo Picasso, 1934, colorful',
    [Values.pencil]: 'pencil art, pencil drawing, highly detailed',
    [Values.portrait]: '50mm portrait photography, hard rim lighting photography',
    [Values.renaissance]: 'painting, renaissance old master royal collection, artstation',
    [Values.soviet]: 'picture from soviet cartoons',
    [Values.studio]:
        'glamorous, emotional ,shot in the photo studio, professional studio lighting, backlit, rim lighting, 8k',
}

const TIMEOUT_MS = 60_000
const RETRY_PARAMS = {
    retries: 5,
    delayMs: 12_000,
}

const KANDINSKY_API_PREFIX = 'https://api.fusionbrain.ai/api/v1/text2image'

const KANDINSKY_RUN_API_URL = `${KANDINSKY_API_PREFIX}/run`

const FAKE_API_HEADERS = createFakeHeaders({
    origin: 'https://editor.fusionbrain.ai',
})

const REQUEST_PARAMS = {
    headers: FAKE_API_HEADERS,
    timeout: TIMEOUT_MS,
}

const getStatusUrl = (pocket: string) => `${KANDINSKY_API_PREFIX}/generate/pockets/${pocket}/status`
const getEntitiesUrl = (pocket: string) => `${KANDINSKY_API_PREFIX}/generate/pockets/${pocket}/entities`

type KandinskyResponse<T> =
    | {
        success: true
        result: T
    }
    | {
        success: false
    }

type RunResponse = KandinskyResponse<{ pocketId: string }>

const enum Status {
    Processing = 'PROCESSING',
    Success = 'SUCCESS',
}

type StatusResponse = KandinskyResponse<Status>

type ImageInstance = {
    response: [string] // base64
}

type EntitiesResponse = KandinskyResponse<ImageInstance[]>

export class InvalidKandinskyResponseError extends Error {
    constructor(private _response: unknown) {
        super('Invalid Dalle response')
    }
}

export const requestKandinskyImages: ValueOf<RequestKandinskyImagesInjection> = async ({ prompt, style }) => {
    info('Requesting Kandinsky images for prompt', prompt)

    const injectedStyle = style ? STYLE_TO_PROMPT[style] : ''
    const injectedPrompt = injectedStyle ? `${prompt}, ${injectedStyle}` : prompt

    const { data: runResult } = await axios.post<RunResponse>(
        KANDINSKY_RUN_API_URL,
        jsonToFormData({ queueType: 'generate', query: injectedPrompt, preset: '1', style: injectedStyle }),
        {
            headers: FAKE_API_HEADERS,
            timeout: TIMEOUT_MS,
        },
    )

    if (!runResult.success) throw new InvalidKandinskyResponseError(runResult)

    info('Received Kandinsky pocket id', runResult.result.pocketId)

    const { pocketId } = runResult.result

    const { data: statusResult } = await retryUntil(
        () => axios.get<StatusResponse>(getStatusUrl(pocketId), REQUEST_PARAMS),
        ({ data }) => data.success && data.result === Status.Success,
        RETRY_PARAMS,
    )

    if (!statusResult.success) throw new InvalidKandinskyResponseError(statusResult)

    info('Received Kandinsky status', statusResult.result)

    const { data: entitiesResult } = await axios.get<EntitiesResponse>(getEntitiesUrl(pocketId), REQUEST_PARAMS)

    if (!entitiesResult.success) throw new InvalidKandinskyResponseError(entitiesResult)

    const { response } = entitiesResult.result[0]

    if (!response || typeof response[0] !== 'string') {
        error('Invalid Dalle response', entitiesResult)
        throw new InvalidKandinskyResponseError(entitiesResult)
    }

    info('Received Kandinsky images', response.length)

    return response.map((v) => new Buffer(base64Decode(v)))
}
