import { config } from 'dotenv'
import { resolve } from 'path'

const { NODE_ENV, ENV_FILE_PATH } = process.env

config({
  debug: true,
  path:
    NODE_ENV === 'production'
      ? ENV_FILE_PATH
      : resolve(__dirname, '../..', '.env'),
})

if (NODE_ENV === 'production') {
  require('source-map-support').install()
}
