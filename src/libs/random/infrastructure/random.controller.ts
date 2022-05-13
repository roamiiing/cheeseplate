import { wrapUseCase } from '@/libs/shared/telegraf'
import { Telegraf } from 'telegraf'
import { createTagsContainer } from './random.container'
import { BEN_COMMAND, PICK_COMMAND, ROLL_COMMAND } from '../application'
import { escapeHtml, stripCommand } from '@/libs/shared/strings'
import { pipe } from 'fp-ts/function'

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

    bot.command(PICK_COMMAND, async ctx => {
      const choices = pipe(ctx.message.text, stripCommand(PICK_COMMAND), raw =>
        raw
          .split(/\n/.test(raw) ? '\n' : ',')
          .map(v => v.trim())
          .filter(v => !!v),
      )

      await wrapUseCase(ctx, randomContainer.cradle.pickUseCase, { choices })
    })
  }
