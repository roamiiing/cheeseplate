import { AwilixContainer } from 'awilix'
import { Bot } from 'grammy'

import { PickChoicesArray } from '@/libs/random/domain'
import {
  createRandomContainer,
  RandomContainerItems,
} from '@/libs/random/infrastructure'
import { LocaleStore } from '@/libs/shared/intl'
import { stripFirst } from '@/libs/shared/strings'
import { mapLocalizedZodError } from '@/libs/shared/validation'
import { Controller, Logger, ScopedLogger } from '@/libs/shared/workflow'

export type RandomControllerDeps = {
  logger: Logger
  bot: Bot
  localeStore: LocaleStore
}

export class RandomController implements Controller {
  private readonly _container: AwilixContainer<RandomContainerItems>

  constructor(private readonly _deps: RandomControllerDeps) {
    this._container = createRandomContainer({
      deps: {
        logger: this._deps.logger,
        localeStore: this._deps.localeStore,
      },
    })
  }

  register(): void {
    this._registerBen()
    this._registerPick()
    this._registerRoll()
  }

  private _registerBen() {
    const { benUseCase } = this._container.cradle
    const { bot } = this._deps

    bot.command('ben', async ctx => {
      this._logger.info('ben command')

      const { gif } = await benUseCase()
      await ctx.replyWithVideo(gif, {
        disable_notification: true,
      })
    })
  }

  private _registerPick() {
    const { pickUseCase } = this._container.cradle
    const { bot, localeStore: t } = this._deps

    bot.command('pick', async ctx => {
      this._logger.info('pick command')

      const input = ctx.message?.text

      if (!input) {
        return await ctx.reply(t.get('pick.errors.choices.required'), {
          disable_notification: true,
          parse_mode: 'HTML',
        })
      }

      const strippedMessage = stripFirst(input)

      const choices = strippedMessage
        .split(/\n/.test(strippedMessage) ? '\n' : ',')
        .map(v => v.trim())
        .filter(v => !!v)

      const validated = await PickChoicesArray.safeParseAsync(choices)

      if (!validated.success) {
        return await ctx.reply(mapLocalizedZodError(t)(validated.error), {
          disable_notification: true,
          parse_mode: 'HTML',
        })
      }

      const { choice } = await pickUseCase({ choices })

      return await ctx.reply(t.get('pick.choice', choice), {
        parse_mode: 'HTML',
        disable_notification: true,
      })
    })
  }

  private _registerRoll() {
    const { rollUseCase } = this._container.cradle
    const { bot, localeStore: t } = this._deps

    bot.command('roll', async ctx => {
      this._logger.info('roll command')

      const input = ctx.message?.text ?? ''

      const strippedMessage = stripFirst(input) || null

      const { prob, parts, of } = await rollUseCase()

      const reply = strippedMessage
        ? t.get('roll.prediction.full', strippedMessage, prob, parts, of)
        : t.get('roll.prediction.empty', prob)

      return await ctx.reply(reply, {
        parse_mode: 'HTML',
        disable_notification: true,
      })
    })
  }

  private get _logger(): ScopedLogger {
    return this._deps.logger.withScope('randomController')
  }
}
