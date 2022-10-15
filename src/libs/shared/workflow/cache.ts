import { Time } from '@/libs/shared/units'

export type CacheOptions = {
  /**
   * If set to 'infinite', will never be invalidated
   * @default 5 hours
   */
  ttl: Time | 'infinite'
}

export type CacheDebugInfo = {
  entries: number
}

export interface Cache {
  memoize<T, R>(
    fnName: string,
    fn: (arg: T) => Promise<R>,
    options?: Partial<CacheOptions>,
  ): (arg: T) => Promise<R>

  invalidate(fnName: string): Promise<void>

  getDebugInfo(): Promise<CacheDebugInfo>
}
