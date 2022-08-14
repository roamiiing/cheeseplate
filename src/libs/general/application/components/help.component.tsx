import * as React from 'react'

import { Br } from '@/libs/shared/react'

export type HelpProps = {
  commands: {
    command: string
    description: string
    example?: string
  }[]
}

export const Help: React.FC<HelpProps> = ({ commands }) => (
  <>
    <b>Помощь 🚑</b>

    <Br lines={2} />

    {commands.map(({ command, description, example }, i) => (
      <React.Fragment key={i}>
        <b>✨ /{command}</b>
        <Br />
        {description}
        {example && (
          <>
            <Br />
            <i>{example}</i>
          </>
        )}
        <Br lines={2} />
      </React.Fragment>
    ))}
  </>
)
