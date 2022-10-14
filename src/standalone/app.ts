import { resolve } from 'path'

import { config } from 'dotenv'

const { NODE_ENV, ENV_FILE_PATH } = process.env

config({
  debug: true,
  path:
    NODE_ENV === 'production'
      ? ENV_FILE_PATH
      : resolve(__dirname, '../..', '.env'),
})

if (NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('source-map-support').install()
}

import { captureError, initSentry } from '@/app'
import { createAppContainer } from '@/app/container'

const {
  // include all features by default
  FEATURES_MASK = '63',
} = process.env

const appContainer = createAppContainer()

if (process.env.NODE_ENV === 'production') {
  initSentry()
}

appContainer.cradle.configureModules(parseInt(FEATURES_MASK, 10))

appContainer.cradle.botBuilder.run()

appContainer.cradle.bot.catch((err, ctx) => {
  if (process.env.NODE_ENV === 'production') {
    captureError(err, ctx)
  }

  console.error(err, ctx)
})

process.once('SIGINT', () => appContainer.cradle.bot.stop('SIGINT'))
process.once('SIGTERM', () => appContainer.cradle.bot.stop('SIGTERM'))

export const launchBot = async () => {
  await appContainer.cradle.bot.launch()

  console.log('Bot started')
}
