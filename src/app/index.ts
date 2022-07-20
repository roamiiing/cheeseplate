import './config'

import { appContainer } from './container'
import { captureError, initSentry } from './misc'

if (process.env.NODE_ENV === 'production') {
  initSentry()
}

appContainer.cradle.configureModules()

appContainer.cradle.botBuilder.run()

appContainer.cradle.bot.catch((err, ctx) => {
  if (process.env.NODE_ENV === 'production') {
    captureError(err, ctx)
  }

  console.error(err, ctx)
})

process.once('SIGINT', () => appContainer.cradle.bot.stop('SIGINT'))
process.once('SIGTERM', () => appContainer.cradle.bot.stop('SIGTERM'))
;(async () => {
  await appContainer.cradle.bot.launch()

  console.log('Bot started')
})()
