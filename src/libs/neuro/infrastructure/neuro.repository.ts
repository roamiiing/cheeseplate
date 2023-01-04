import axios from 'axios'

import { RugptDeps, DalleDeps } from '@/libs/neuro/application'
import { createFakeHeaders } from '@/libs/shared/http'
import { Time } from '@/libs/shared/units'
import { Logger } from '@/libs/shared/workflow'

const DALLE_TIMEOUT = Time(1, 'm')

const BALABOBA_TIMEOUT = Time(1, 'm')

type DalleMiniResponse = {
  images?: string[] // base64 strings
}

type RugptResponse = {
  predictions?: string
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

export class InvalidRugptResponseError extends Error {
  constructor(private _response: unknown) {
    super('Invalid Rugpt response')
  }
}

export const requestRugptText = ({
  logger,
}: NeuroRepositoryDeps): RugptDeps['requestRugptText'] => {
  const scopedLogger = logger.withScope('requestRugptText')

  return async prompt => {
    scopedLogger.info('Requesting Rugpt text')

    const { data } = await axios.post<RugptResponse>(
      'https://api.aicloud.sbercloud.ru/public/v1/public_inference/gpt3/predict',
      {
        text: prompt,
      },
      {
        timeout: BALABOBA_TIMEOUT.in('ms'),
        headers: createFakeHeaders({
          host: 'api.aicloud.sbercloud.ru',
          origin: 'https://russiannlp.github.io',
        }),
      },
    )

    if (!data.predictions || typeof data.predictions !== 'string') {
      throw new InvalidRugptResponseError(data)
    }

    scopedLogger.info('Received Rugpt text')

    return data.predictions
  }
}
