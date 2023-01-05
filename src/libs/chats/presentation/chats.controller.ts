import { PrismaClient } from '@prisma/client'
import { Bot } from 'grammy'

import { Time } from '@/libs/shared/units'
import { Cache, Controller, Logger, ScopedLogger } from '@/libs/shared/workflow'

export type ChatsControllerDeps = {
  prismaClient: PrismaClient
  cache: Cache
  logger: Logger
  bot: Bot
}

// TODO: remove when bot is ready
export class ChatsController implements Controller {
  constructor(private readonly _deps: ChatsControllerDeps) {}

  public register(): void {
    this._registerChatChecker()
  }

  private _registerChatChecker() {
    this._deps.bot.use(async (ctx, next) => {
      const chatId = ctx.chat?.id

      if (!chatId) {
        this._logger.warn('Chat id is not defined', { update: ctx.update })
        return
      }

      const isRegistered = await this._checkChatInWhiteList(chatId)

      if (!isRegistered) {
        this._logger.warn('Chat is not registered', { update: ctx.update })
        return
      }

      await next()
    })
  }

  private get _checkChatInWhiteList() {
    return this._deps.cache.memoize(
      'checkChatInWhiteList',
      async (id: number) => {
        const chat = await this._deps.prismaClient.chat.findUnique({
          where: {
            telegramId: id,
          },
        })

        return !!chat
      },
      {
        ttl: Time(1, 'h'),
      },
    )
  }

  private get _logger(): ScopedLogger {
    return this._deps.logger.withScope('ChatsController')
  }
}
