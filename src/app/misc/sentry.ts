import * as Sentry from '@sentry/node'

const { SENTRY_DSN = '' } = process.env

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    normalizeDepth: 12,
  })
}

export const captureError = (e: unknown, ctx: unknown) => {
  Sentry.captureException(e, {
    extra: {
      botContext: ctx,
    },
  })
}
