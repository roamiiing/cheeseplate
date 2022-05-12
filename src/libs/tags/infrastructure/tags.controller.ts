import { wrapUseCase } from '@/libs/shared/telegraf'
import { PrismaClient } from '@prisma/client'
import { deunionize, Telegraf } from 'telegraf'
import {
  SET_TAG_COMMAND,
  LIST_TAGS_COMMAND,
  DELETE_TAG_COMMAND,
  DRY_PING_COMMAND,
} from '@/libs/tags/application'
import { createTagsContainer } from './tags.container'
import { TAG_REGEX, TAG_SYMBOL } from '@/libs/tags/domain'

export type UsersControllerDeps = {
  bot: Telegraf
  prismaClient: PrismaClient
}

export const configureTags =
  ({ bot, prismaClient }: UsersControllerDeps) =>
  () => {
    const tagsContainer = createTagsContainer({
      prismaClient,
    })()

    bot.command(SET_TAG_COMMAND, async ctx => {
      const [, tag] = ctx.message.text.split(/\s+/)

      await wrapUseCase(ctx, tagsContainer.cradle.setTagUseCase, { tag })
    })

    bot.command(DELETE_TAG_COMMAND, async ctx => {
      const [, tag] = ctx.message.text.split(/\s+/)

      await wrapUseCase(ctx, tagsContainer.cradle.deleteTagUseCase, { tag })
    })

    bot.command(DRY_PING_COMMAND, async ctx => {
      const [, ...tags] = ctx.message.text.split(/\s+/)

      await wrapUseCase(ctx, tagsContainer.cradle.pingUseCase, {
        tags,
        dry: true,
      })
    })

    bot.command(LIST_TAGS_COMMAND, async ctx => {
      await wrapUseCase(ctx, tagsContainer.cradle.listTagsUseCase)
    })

    bot.use(async ctx => {
      const tags = [
        ...(deunionize(ctx.message)?.text?.matchAll(TAG_REGEX) ?? []),
        // also match picture/video/repost captions
        ...(deunionize(ctx.message)?.caption?.matchAll(TAG_REGEX) ?? []),
      ]
        .map(([str]) => str)
        .map(str => str.replace(TAG_SYMBOL, ''))

      await wrapUseCase(ctx, tagsContainer.cradle.pingUseCase, { tags })
    })
  }
