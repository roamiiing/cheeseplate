import { appContainer } from './app'

export const webhook = appContainer.cradle.bot.webhookCallback('/cheeseplate')

/** Same singleton as the app; use for lifecycle hooks from `api/index.js`. */
export const prismaClient = appContainer.cradle.prismaClient
