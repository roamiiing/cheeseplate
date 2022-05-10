import { getMarkupWith } from '@/libs/shared/react'
import { UseCase } from '@/libs/shared/workflow'
import { Tag, Chat } from '@prisma/client'
import * as React from 'react'
import { TagsList } from './components'

export const LIST_TAGS_COMMAND = '/taglist'

export type ListTagsDeps = {
  listTags: (chatId: Chat['telegramId']) => Promise<Tag['tag'][]>
}

export type ListTagsInput = void

export const listTagsUseCase =
  ({ listTags }: ListTagsDeps): UseCase<ListTagsInput> =>
  async ({ chatInfo: { chatId } }) => {
    const tags = await listTags(chatId)

    return { message: getMarkupWith(<TagsList tags={tags} />) }
  }
