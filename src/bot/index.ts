if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config()
}

import { RootController } from './root.controller'

const controller = new RootController()

controller.register()
controller.run()
