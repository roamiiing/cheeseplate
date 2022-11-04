// const { NODE_ENV } = process.env

// TODO: investigate why source-map-support doesn't work on vercel
// if (NODE_ENV === 'production') {
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   require('source-map-support').install()
// }
import { asValue } from 'awilix'

import { captureError, initSentry } from '@/app'
import { createAppContainer } from '@/app/container'
import { StubQueue } from '@/libs/shared/queue'

const {
  // include all features by default
  FEATURES_MASK = '63',
} = process.env

const appContainer = createAppContainer()

appContainer.register({
  queue: asValue(new StubQueue()),
})

if (process.env.NODE_ENV === 'production') {
  initSentry()
}

appContainer.cradle.configureModules(parseInt(FEATURES_MASK, 10))

appContainer.cradle.botBuilder.add(
  () => {
    appContainer.cradle.prismaClient.$connect()
  },
  {
    priority: 50,
  },
)
appContainer.cradle.botBuilder.run()

appContainer.cradle.bot.catch((err, ctx) => {
  if (process.env.NODE_ENV === 'production') {
    captureError(err, ctx)
  }

  console.error(err, ctx)
})

export { appContainer }
