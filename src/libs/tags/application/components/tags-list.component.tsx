import { Br } from '@/libs/shared/react'
import * as React from 'react'

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
