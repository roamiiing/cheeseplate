import axios from 'axios'

import { DalleDeps } from '@/libs/neuro/application'
import { Time } from '@/libs/shared/units'

const DALLE_TIMEOUT = Time(1, 'm')

type DalleMiniResponse = {
  images?: string[] // base64 strings
}

export class InvalidDalleResponseError extends Error {
  constructor(private _response: unknown) {
    super('Invalid Dalle response')
  }
}

export const requestDalleMiniImages =
  (): DalleDeps['requestDalleMiniImages'] => async prompt => {
    const { data } = await axios.post<DalleMiniResponse>(
      'https://backend.craiyon.com/generate',
      {
        prompt,
      },
      {
        timeout: DALLE_TIMEOUT.in('ms'),
      },
    )

    if (!data.images || typeof data.images[0] !== 'string') {
      throw new InvalidDalleResponseError(data)
    }

    return data.images.map(v => Buffer.from(v, 'base64'))
  }
