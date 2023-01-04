import axios from 'axios'

import { DalleDeps } from '@/libs/neuro/application'
import { Time } from '@/libs/shared/units'
import { Logger } from '@/libs/shared/workflow'

const DALLE_TIMEOUT = Time(1, 'm')

type DalleMiniResponse = {
  images?: string[] // base64 strings
}

export type NeuroRepositoryDeps = {
  logger: Logger
}

export class InvalidDalleResponseError extends Error {
  constructor(private _response: unknown) {
    super('Invalid Dalle response')
  }
}

export const requestDalleMiniImages = ({
  logger,
}: NeuroRepositoryDeps): DalleDeps['requestDalleMiniImages'] => {
  const scopedLogger = logger.withScope('requestDalleMiniImages')

  return async prompt => {
    scopedLogger.info('Requesting Dalle Mini images')

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
      scopedLogger.error('Invalid Dalle response', data)
      throw new InvalidDalleResponseError(data)
    }

    scopedLogger.info('Received Dalle Mini images')

    return data.images.map(v => Buffer.from(v, 'base64'))
  }
}
