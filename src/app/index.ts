import { config } from 'dotenv'

config()

import { appContainer } from './container'

appContainer.cradle.configureAdditionalCommands()
appContainer.cradle.configureUsers()
appContainer.cradle.configureRandom()
appContainer.cradle.configureTags()

appContainer.cradle.bot.catch((err, ctx) => {
  console.error(err, ctx)
})

appContainer.cradle.bot.launch()

console.log('Bot started')

process.once('SIGINT', () => appContainer.cradle.bot.stop('SIGINT'))
process.once('SIGTERM', () => appContainer.cradle.bot.stop('SIGTERM'))
