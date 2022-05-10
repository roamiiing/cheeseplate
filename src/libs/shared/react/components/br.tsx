import * as React from 'react'

export type BrProps = {
  lines?: number
}

export const Br: React.FC<BrProps> = ({ lines = 1 }) => (
  <>{Array.from({ length: lines }).fill('\n')}</>
)
