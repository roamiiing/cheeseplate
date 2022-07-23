import { PrismaClient } from '@prisma/client'
import { deunionize, Telegraf } from 'telegraf'

import { wrapUseCase } from '@/libs/shared/telegraf'
import {
  SET_TAG_COMMAND,
  LIST_TAGS_COMMAND,
  DELETE_TAG_COMMAND,
  DRY_PING_COMMAND,
} from '@/libs/tags/application'
import { TAG_REGEX, TAG_SYMBOL } from '@/libs/tags/domain'
import { PriorityBuilder } from '@/libs/shared/workflow'
import { CheeseBot } from '@/libs/shared/bot'
import { Queue } from '@/libs/shared/queue'

import { createTagsContainer } from './tags.container'

export type UsersControllerDeps = {
  bot: Telegraf
  prismaClient: PrismaClient
  botBuilder: PriorityBuilder
  queue: Queue
  cheeseBot: CheeseBot
}

export const configureTags =
  ({ bot, prismaClient, botBuilder, cheeseBot, queue }: UsersControllerDeps) =>
  () => {
    const tagsContainer = createTagsContainer({
      prismaClient,
    })

    botBuilder
      .add(() =>
        cheeseBot.useCommand(
          SET_TAG_COMMAND,
          tagsContainer.cradle.setTagUseCase,
          ({ strippedMessage }) => ({ tag: strippedMessage.split(/\s+/)[0] }),
        ),
      )
      .add(() =>
        cheeseBot.useCommand(
          DELETE_TAG_COMMAND,
          tagsContainer.cradle.deleteTagUseCase,
          ({ strippedMessage }) => ({ tag: strippedMessage.split(/\s+/)[0] }),
        ),
      )
      .add(() =>
        cheeseBot.useCommand(
          DRY_PING_COMMAND,
          tagsContainer.cradle.pingUseCase,
          ({ strippedMessage }) => ({
            tags: strippedMessage.split(/\s+/),
            dry: true,
          }),
        ),
      )
      .add(() =>
        cheeseBot.useCommand(
          LIST_TAGS_COMMAND,
          tagsContainer.cradle.listTagsUseCase,
        ),
      )
      .add(
        () =>
          bot.use(async ctx => {
            const tags = [
              ...(deunionize(ctx.message)?.text?.matchAll(TAG_REGEX) ?? []),
              // also match picture/video/repost captions
              ...(deunionize(ctx.message)?.caption?.matchAll(TAG_REGEX) ?? []),
            ]
              .map(([str]) => str)
              .map(str => str.replace(TAG_SYMBOL, ''))

            // TODO: move to cheeseBot
            await wrapUseCase(ctx, tagsContainer.cradle.pingUseCase, queue, {
              tags,
            })
          }),
        {
          priority: -10,
        },
      )
  }
