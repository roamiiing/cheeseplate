import { User, Chat } from '@prisma/client'
import * as React from 'react'
import { deunionize } from 'telegraf'

import { getMarkupWith } from '@/libs/shared/react'
import { EntityType, UseCase } from '@/libs/shared/workflow'

import { About, AboutProps } from '../components'

export const ABOUT_COMMAND = '/about'

export type AboutDeps = {
  getUserInfo: (
    userId: User['telegramId'],
    chatId: Chat['telegramId'],
  ) => Promise<AboutProps['userInfo']>
  getUserInfoByDisplayName: (
    displayName: User['displayName'],
    chatId: Chat['telegramId'],
  ) => Promise<AboutProps['userInfo']>
  getUserInfoByTelegramUsername: (
    username: Exclude<User['telegramUsername'], null>,
    chatId: Chat['telegramId'],
  ) => Promise<AboutProps['userInfo']>
}

export type AboutInput = {
  displayName?: string
}

export const aboutUseCase =
  ({
    getUserInfo,
    getUserInfoByDisplayName,
    getUserInfoByTelegramUsername,
  }: AboutDeps): UseCase<AboutInput> =>
  async ({
    userInfo: { userId },
    chatInfo: { chatId },
    messageInfo: { entities, repliedMessageInfo },
    input: { displayName },
  }) => {
    const mention = deunionize(entities[1])

    const searchUserId =
      mention?.type === EntityType.TextMention
        ? mention.userId
        : repliedMessageInfo
        ? repliedMessageInfo.userInfo.userId
        : userId

    const userInfo = await (mention?.type === EntityType.Mention
      ? getUserInfoByTelegramUsername(mention.username, chatId)
      : displayName
      ? getUserInfoByDisplayName(displayName, chatId)
      : getUserInfo(searchUserId, chatId))

    return {
      message: getMarkupWith(<About userInfo={userInfo} />),
      options: {
        success: !!userInfo,
      },
    }
  }
