import { Telegraf } from 'telegraf'
import { pipe } from 'fp-ts/function'

import { wrapUseCase } from '@/libs/shared/telegraf'
import { escapeHtml, stripCommand } from '@/libs/shared/strings'
import { PriorityBuilder } from '@/libs/shared/workflow'
import {
  BEN_COMMAND,
  PICK_COMMAND,
  ROLL_COMMAND,
} from '@/libs/random/application'

import { createTagsContainer } from './random.container'

export type RandomControllerDeps = {
  bot: Telegraf
  botBuilder: PriorityBuilder
}

export const configureRandom =
  ({ bot, botBuilder }: RandomControllerDeps) =>
  () => {
    const randomContainer = createTagsContainer()

    botBuilder
      .add(() => {
        bot.command(ROLL_COMMAND, async ctx => {
          const message = stripCommand(ROLL_COMMAND)(ctx.message.text)

          await wrapUseCase(ctx, randomContainer.cradle.rollUseCase, {
            message,
          })
        })
      })
      .add(() =>
        bot.command(BEN_COMMAND, async ctx => {
          await wrapUseCase(ctx, randomContainer.cradle.benUseCase)
        }),
      )
      .add(() =>
        bot.command(PICK_COMMAND, async ctx => {
          const choices = pipe(
            ctx.message.text,
            stripCommand(PICK_COMMAND),
            raw =>
              raw
                .split(/\n/.test(raw) ? '\n' : ',')
                .map(v => v.trim())
                .filter(v => !!v),
          )

          await wrapUseCase(ctx, randomContainer.cradle.pickUseCase, {
            choices,
          })
        }),
      )
  }
