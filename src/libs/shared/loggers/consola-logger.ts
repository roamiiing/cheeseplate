import { Consola, JSONReporter, FancyReporter, LogLevel } from 'consola'

import { Logger, ScopedLogger } from '@/libs/shared/workflow'

export type ConsolaLoggerConfig = {
  isProduction: boolean
}

export class ConsolaLogger implements Logger {
  private readonly _logger: Consola

  constructor({ isProduction = false }: ConsolaLoggerConfig) {
    this._logger = new Consola({
      level: isProduction ? LogLevel.Info : LogLevel.Verbose,
      reporters: [isProduction ? new JSONReporter() : new FancyReporter()],
    })
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
    }
  }
}
