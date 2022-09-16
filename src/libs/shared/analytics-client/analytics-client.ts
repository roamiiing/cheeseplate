import { captureException } from '@sentry/node'
import axios from 'axios'

import { Time } from '@/libs/shared/units'

import { SendEvent } from './types'

const ANALYTICS_URL =
  process.env.ANALYTICS_URL ?? 'https://analytic.s.talkiiing.ru'
const ANALYTICS_DOMAIN =
  process.env.ANALYTICS_DOMAIN ?? 'cheeseplate.talkiiing.ru'
const IS_SEND_ANALYTICS = process.env.NODE_ENV === 'production'

export const sendEvent: SendEvent = (event, data) => {
  console.log(event)
  if (IS_SEND_ANALYTICS) {
    try {
      axios.post(
        `${ANALYTICS_URL}/api/event`,
        {
          n: event,
          u: `https://${ANALYTICS_DOMAIN}/#goal`,
          d: ANALYTICS_DOMAIN,
          r: null,
          p: JSON.stringify(data),
        },
        {
          timeout: Time(10, 's').in('ms'),
        },
      )
    } catch (e) {
      captureException(e)
    }
  }
}
