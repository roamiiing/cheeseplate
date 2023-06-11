import axios from 'axios'
import { decode as base64Decode } from 'std/encoding/base64.ts'
import { Buffer } from 'std/streams/buffer.ts'
import { error, info } from 'std/log/mod.ts'
import { DalleDeps } from 'misc/application'
import { createFakeHeaders } from '../../../shared/http/fake-headers.ts'

const DALLE_TIMEOUT_MS = 100_000
const DALLE_API_URL = 'https://backend.craiyon.com/generate'
const FAKE_API_HEADERS = createFakeHeaders({
    origin: 'https://craiyon.com',
})

export type DalleMiniResponse = {
    /**
     * Base64-encoded images
     */
    images?: string[]
}

export class InvalidDalleResponseError extends Error {
    constructor(private _response: unknown) {
        super('Invalid Dalle response')
    }
}

export const requestDalleMiniImages: DalleDeps['requestDalleMiniImages'] = async (prompt) => {
    info('Requesting Dalle Mini images for prompt', prompt)

    const { data } = await axios.post<DalleMiniResponse>(
        DALLE_API_URL,
        { prompt },
        { timeout: DALLE_TIMEOUT_MS, headers: FAKE_API_HEADERS },
    )

    if (!data.images || typeof data.images[0] !== 'string') {
        error('Invalid Dalle response', data)
        throw new InvalidDalleResponseError(data)
    }

    info('Received Dalle Mini images', data.images.length)

    return data.images.map((v) => new Buffer(base64Decode(v)))
}
