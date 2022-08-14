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
