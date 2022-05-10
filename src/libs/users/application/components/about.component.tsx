import { Br } from '@/libs/shared/react'
import * as React from 'react'

export type AboutProps = {
  userInfo?: {
    displayName: string
    id: bigint
    tags: string[]
    username?: string
  }
}

export const About: React.FC<AboutProps> = ({ userInfo }) => {
  const link = React.useMemo(
    () => userInfo?.username && `https://t.me/${userInfo?.username}`,
    [userInfo?.username],
  )

  return (
    <>
      {userInfo ? (
        <>
          <>
            Инфа о юзере <b>{userInfo.displayName}</b>
          </>

          <Br lines={2} />

          {userInfo.tags.length === 0 ? (
            <>Нет тегов</>
          ) : (
            <>
              Теги: <b>{userInfo.tags.join(', ')}</b>
            </>
          )}

          <Br lines={2} />

          {link ? <a href={link}>{link}</a> : <>Нет никнейма в Telegram</>}
        </>
      ) : (
        <b>Такого пользователя нет</b>
      )}
    </>
  )
}
