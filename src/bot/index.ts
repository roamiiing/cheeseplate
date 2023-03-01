if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config()
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('source-map-support').install()
}

import { RootController } from './root.controller'

const controller = new RootController()

controller.register()
controller.run()
