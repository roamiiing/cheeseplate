import * as React from 'react'

import { Br } from '@/libs/shared/react'

type TagsListProps = {
  tags: string[]
}

export const TagsList: React.FC<TagsListProps> = ({ tags }) => (
  <>
    <b>Все теги этого чата:</b>

    <Br lines={2} />

    {tags.join(', ')}
  </>
)
