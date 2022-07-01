import { measurement, unit } from 'metriqa'

export const Time = measurement(
  unit('ms'),
  unit('s', 1000),
  unit('m', 60),
  unit('h', 60),
  unit('d', 24),
)

export type Time = ReturnType<typeof Time>
