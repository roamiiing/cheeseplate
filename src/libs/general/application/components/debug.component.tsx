import * as React from 'react'

import { Br } from '@/libs/shared/react'

type Rec = Record<string, string | number>

export type DebugProps = {
  chatInfo: Rec
  serverInfo: Rec
  cacheInfo: Rec
}

export const Debug: React.FC<DebugProps> = ({
  chatInfo,
  serverInfo,
  cacheInfo,
}) => (
  <>
    <b>🤐 Сверхсекретная информация 🤫</b>

    <Br lines={2} />

    <b>Чат:</b>
    {Object.entries(chatInfo).map(([key, val], i) => (
      <React.Fragment key={i}>
        <Br />
        <b>{key}</b>: {val}
      </React.Fragment>
    ))}

    <Br lines={2} />

    <b>Сервер:</b>
    {Object.entries(serverInfo).map(([key, val], i) => (
      <React.Fragment key={i}>
        <Br />
        <b>{key}</b>: {val}
      </React.Fragment>
    ))}

    <Br lines={2} />

    <b>Кэш:</b>
    {Object.entries(cacheInfo).map(([key, val], i) => (
      <React.Fragment key={i}>
        <Br />
        <b>{key}</b>: {val}
      </React.Fragment>
    ))}
  </>
)
