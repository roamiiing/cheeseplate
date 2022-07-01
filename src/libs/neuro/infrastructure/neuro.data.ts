import { DalleDeps, DALLE_TIMEOUT } from '@/libs/neuro/application'
import axios from 'axios'

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
