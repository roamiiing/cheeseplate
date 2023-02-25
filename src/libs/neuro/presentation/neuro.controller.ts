import { AwilixContainer } from 'awilix'
import { Bot } from 'grammy'

import {
  createNeuroContainer,
  NeuroContainerItems,
} from '@/libs/neuro/infrastructure'
import { LocaleStore } from '@/libs/shared/intl'
import { Controller, Logger } from '@/libs/shared/workflow'

import { DalleHandler, RugptHandler } from './handlers'

export type NeuroControllerDeps = {
  logger: Logger
  bot: Bot
  localeStore: LocaleStore
}

export class NeuroController implements Controller {
  private readonly _container: AwilixContainer<NeuroContainerItems>
  private readonly _dalleHandler: DalleHandler
  private readonly _rugptHandler: RugptHandler

  constructor(private readonly _deps: NeuroControllerDeps) {
    this._container = createNeuroContainer({
      maxConcurrentDalleRequests: 10,
      maxConcurrentRugptRequests: 5,

      deps: {
        logger: this._deps.logger,
        localeStore: this._deps.localeStore,
      },
    })

    this._dalleHandler = new DalleHandler(this._container.cradle)
    this._rugptHandler = new RugptHandler(this._container.cradle)
  }

  public register(): void {
    this._deps.bot.use(this._dalleHandler.router)
    this._deps.bot.use(this._rugptHandler.router)
  }
}
