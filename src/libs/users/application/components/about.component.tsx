import { Br } from '@/libs/shared/react'
import * as React from 'react'
import { useRandomReplica } from '@/libs/shared/random'

const userInfoReplica = useRandomReplica({
  replicas: ['Инфа о юзере %username%', 'Инфа о юзвере %username%'],
  placeholders: ['username'],
})

const noTelegramNicknameReplica = useRandomReplica({
  replicas: [
    'Нет никнейма в Telegram',
    'Ссылочка на пользователя потерялась :(',
    'Странный чел, без ника...',
  ],
  placeholders: [],
})

const noTagsReplica = useRandomReplica({
  replicas: ['Нет тегов', 'Теги еще не указаны', 'Теги: пусто :('],
  placeholders: [],
})

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
              Теги: <b>{userInfo.tags.join(', ')}</b>
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
