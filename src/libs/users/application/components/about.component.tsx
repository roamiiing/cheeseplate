import { Br } from '@/libs/shared/react'
import { escapeHtml } from '@/libs/shared/strings'
import * as React from 'react'
import {
  noTagsReplica,
  noTelegramNicknameReplica,
  userInfoReplica,
} from '../replicas'

export type AboutProps = {
  userInfo?: {
    displayName: string
    id: bigint
    tags: string[]
    username?: string
  }
}

export const About: React.FC<AboutProps> = ({ userInfo }) => {
  const link = userInfo?.username && `https://t.me/${userInfo?.username}`

  return (
    <>
      {userInfo ? (
        <>
          {userInfoReplica({
            username: userInfo.displayName,
          })}

          <Br lines={2} />

          {userInfo.tags.length === 0 ? (
            noTagsReplica()
          ) : (
            <>
              Теги: <b>{userInfo.tags.map(escapeHtml).join(', ')}</b>
            </>
          )}

          <Br lines={2} />

          {link ? (
            <a href={link}>{link}</a>
          ) : (
            <>{noTelegramNicknameReplica()}</>
          )}
        </>
      ) : (
        <b>Такого пользователя нет</b>
      )}
    </>
  )
}
