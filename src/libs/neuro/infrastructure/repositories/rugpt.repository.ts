import axios from 'axios'

import { RugptDeps } from '@/libs/neuro/application'
import { createFakeHeaders } from '@/libs/shared/http'
import { Time } from '@/libs/shared/units'
import { Logger } from '@/libs/shared/workflow'

export type RugptRepositoryDeps = {
  logger: Logger
}

type RugptResponse = {
  predictions?: string
}

const RUGPT_TIMEOUT = Time(1, 'm')

export class InvalidRugptResponseError extends Error {
  constructor(private _response: unknown) {
    super('Invalid Rugpt response')
  }
}

export const requestRugptText = ({
  logger,
}: RugptRepositoryDeps): RugptDeps['requestRugptText'] => {
  const scopedLogger = logger.withScope('requestRugptText')

  return async prompt => {
    scopedLogger.info('Requesting Rugpt text')

    const { data } = await axios.post<RugptResponse>(
      'https://api.aicloud.sbercloud.ru/public/v1/public_inference/gpt3/predict',
      {
        text: prompt,
      },
      {
        timeout: RUGPT_TIMEOUT.in('ms'),
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
