export type LogType = 'info' | 'success' | 'warn' | 'error' | 'debug'

export type ScopedLogger = {
  [key in LogType]: (message: string, ...additional: unknown[]) => void
}

export type Logger = {
  [key in LogType]: (
    scope: string,
    message: string,
    ...additional: unknown[]
  ) => void
} & {
  withScope(scope: string): ScopedLogger
}
