import { measurement, unit } from 'metriqa'

export const information = measurement(
  unit('b'),
  unit('B', 8),
  unit('KB', 1024),
  unit('MB', 1024),
  unit('GB', 1024),
)
export type Information = ReturnType<typeof information>

export const time = measurement(
  unit('ms'),
  unit('s', 1000),
  unit('m', 60),
  unit('h', 60),
  unit('d', 24),
)
export type Time = ReturnType<typeof time>
