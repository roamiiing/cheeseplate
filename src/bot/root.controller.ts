import { autoRetry } from '@grammyjs/auto-retry'
import { limit } from '@grammyjs/ratelimiter'
import { run, RunnerHandle } from '@grammyjs/runner'
import { apiThrottler } from '@grammyjs/transformer-throttler'
import { UserFromGetMe } from '@grammyjs/types'
import { asClass, asValue, createContainer } from 'awilix'
import { Bot, BotError } from 'grammy'

import { NeuroController } from '@/libs/neuro/presentation'
import { ConsolaLogger } from '@/libs/shared/loggers'
import { Controller, Logger, ScopedLogger } from '@/libs/shared/workflow'

export type RootContainerItems = {
  bot: Bot
  neuroController: Controller
  logger: Logger
}

export class RootController implements Controller {
  private readonly _container = createContainer<RootContainerItems>()

  private readonly _bot = new Bot(process.env.TG_BOT_TOKEN ?? '')
  private readonly _logger = new ConsolaLogger({
    isProduction: process.env.NODE_ENV === 'production',
  })

  private _me: UserFromGetMe | null = null

  public register(): void {
    this._scaffoldContainer()
    this._scaffoldBot()
    this._container.cradle.neuroController.register()
  }

  public async run(): Promise<RunnerHandle> {
    this._logger.info('RootController', 'Starting bot')

    const handle = run(this._bot)

    if (handle.isRunning()) {
      this._scopedLogger.success('Bot started')
    } else {
      this._scopedLogger.error('Bot failed to start')
    }

    this._me = await this._bot.api.getMe()

    this._scopedLogger.info('Bot info', {
      id: this._me.id,
      username: this._me.username,
      is_bot: this._me.is_bot,
    })

    return handle
  }

  private _scaffoldContainer(): void {
    this._container.register({
      bot: asValue(this._bot),
      neuroController: asClass(NeuroController).singleton(),
      logger: asValue(this._logger),
    })
  }

  private _scaffoldBot(): void {
    this._bot.use(
      limit({
        timeFrame: 2000,
        limit: 5,

        onLimitExceeded: async ctx => {
          this._scopedLogger.warn('Limit exceeded', {
            from: ctx.from,
            chat: ctx.chat,
          })
          await ctx.reply('Slow down please')
        },

        keyGenerator: ctx => {
          return [ctx.from?.id.toString(), ctx.chat?.id.toString()].join('###')
        },
      }),
    )

    this._bot.api.deleteWebhook({
      drop_pending_updates: true,
    })
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
    this._scopedLogger.error(err.message, err)
  }

  private get _scopedLogger(): ScopedLogger {
    return this._logger.withScope('RootController')
  }
}
