import { autoRetry } from '@grammyjs/auto-retry'
import { limit } from '@grammyjs/ratelimiter'
import { run, RunnerHandle } from '@grammyjs/runner'
import { apiThrottler } from '@grammyjs/transformer-throttler'
import { asClass, asValue, createContainer } from 'awilix'
import { Bot, BotError } from 'grammy'

import { NeuroController } from '@/libs/neuro/presentation'
import { Controller } from '@/libs/shared/workflow'

export type RootContainerItems = {
  bot: Bot
  neuroController: Controller
}

export class RootController implements Controller {
  private readonly _container = createContainer<RootContainerItems>()

  private readonly _bot = new Bot(process.env.TG_BOT_TOKEN ?? '')

  public register(): void {
    this._scaffoldContainer()
    this._scaffoldBot()
    this._container.cradle.neuroController.register()
  }

  public run(): RunnerHandle {
    return run(this._bot)
  }

  private _scaffoldContainer(): void {
    this._container.register({
      bot: asValue(this._bot),
      neuroController: asClass(NeuroController).singleton(),
    })
  }

  private _scaffoldBot(): void {
    this._bot.use(
      limit({
        timeFrame: 2000,
        limit: 5,

        onLimitExceeded: async ctx => {
          await ctx.reply('Slow down please')
        },

        keyGenerator: ctx => {
          return [ctx.from?.id.toString(), ctx.chat?.id.toString()].join('###')
        },
      }),
    )

    this._bot.api.config.use(apiThrottler())
    this._bot.api.config.use(
      autoRetry({
        maxRetryAttempts: 2,
        maxDelaySeconds: 40,
      }),
    )

    this._bot.catch(this._handleError.bind(this))
  }

  private _handleError(err: BotError): void {
    console.error(err)
  }
}
