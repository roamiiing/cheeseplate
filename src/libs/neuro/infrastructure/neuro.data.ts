import axios from 'axios'

import {
  DalleDeps,
  DALLE_TIMEOUT,
  RuGptDeps,
  RUGPT_TIMEOUT,
} from '@/libs/neuro/application'
import { createFakeHeaders } from '@/libs/shared/http'

type DalleMiniResponse = {
  images?: string[] // base64 strings
}

export const requestDalleMiniImages =
  (): DalleDeps['requestDalleMiniImages'] => async prompt => {
    try {
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
        return null
      }

      return data.images.map(v => ({
        inputType: 'image',
        imageData: Buffer.from(v, 'base64'),
      }))
    } catch (e) {
      console.error('Error with dalle:', e)
      return null
    }
  }

type RuGptResponse = {
  predictions?: string
}

export const requestRuGptText =
  (): RuGptDeps['requestRuGptText'] => async text => {
    try {
      const { data } = await axios.post<RuGptResponse>(
        'https://api.aicloud.sbercloud.ru/public/v1/public_inference/gpt3/predict',
        {
          text,
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
        return null
      }

      return data.predictions
    } catch (e) {
      console.error('Error with rugpt:', e)
      return null
    }
  }
