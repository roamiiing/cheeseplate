import { wrapUseCase } from '@/libs/shared/telegraf'
import { Telegraf } from 'telegraf'
import { createTagsContainer } from './random.container'
import { BEN_COMMAND, ROLL_COMMAND } from '../application'
import { escapeHtml } from '@/libs/shared/strings'

export type RandomControllerDeps = {
  bot: Telegraf
}

export const configureRandom =
  ({ bot }: RandomControllerDeps) =>
  () => {
    const randomContainer = createTagsContainer()

    bot.command(ROLL_COMMAND, async ctx => {
      const [, ...args] = ctx.message.text.split(/\s+/)
      const message = escapeHtml(args.join(' '))

      await wrapUseCase(ctx, randomContainer.cradle.rollUseCase, { message })
    })

    bot.command(BEN_COMMAND, async ctx => {
      await wrapUseCase(ctx, randomContainer.cradle.benUseCase)
    })
  }
