import * as Sentry from '@sentry/node'
import { Consola, JSONReporter, FancyReporter, LogLevel } from 'consola'

import { Logger, ScopedLogger } from '@/libs/shared/workflow'

export type ConsolaLoggerConfig = {
  isProduction: boolean
  sentryDsn?: string
}

export class ConsolaLogger implements Logger {
  private readonly _reportToSentry: boolean

  private readonly _logger: Consola

  constructor({ isProduction = false, sentryDsn }: ConsolaLoggerConfig) {
    this._logger = new Consola({
      level: isProduction ? LogLevel.Info : LogLevel.Verbose,
      reporters: [isProduction ? new JSONReporter() : new FancyReporter()],
    })

    this._reportToSentry = isProduction && sentryDsn !== undefined

    if (this._reportToSentry) {
      Sentry.init({
        dsn: sentryDsn,
      })
    }
  }

  info(scope: string, message: string, ...additional: unknown[]) {
    this._logger.withScope(scope).info(message, ...additional)
  }

  success(scope: string, message: string, ...additional: unknown[]) {
    this._logger.withScope(scope).success(message, ...additional)
  }

  warn(scope: string, message: string, ...additional: unknown[]) {
    this._logger.withScope(scope).warn(message, ...additional)
  }

  error(scope: string, message: string, ...additional: unknown[]) {
    this._logger.withScope(scope).error(message, ...additional)
  }

  debug(scope: string, message: string, ...additional: unknown[]) {
    this._logger.withScope(scope).debug(message, ...additional)
  }

  captureException(error: Error) {
    if (this._reportToSentry) {
      Sentry.captureException(error)
    } else {
      this._logger.error('Captured error:', error.message, error)
    }
  }

  withScope(scope: string): ScopedLogger {
    return {
      info: (message: string, ...additional: unknown[]) =>
        this.info(scope, message, ...additional),
      success: (message: string, ...additional: unknown[]) =>
        this.success(scope, message, ...additional),
      warn: (message: string, ...additional: unknown[]) =>
        this.warn(scope, message, ...additional),
      error: (message: string, ...additional: unknown[]) =>
        this.error(scope, message, ...additional),
      debug: (message: string, ...additional: unknown[]) =>
        this.debug(scope, message, ...additional),
      captureException: (error: Error) => this.captureException(error),
    }
  }
}
