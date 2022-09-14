import { defu } from 'defu'
import bjson from 'json-bigint'

import { Time } from '@/libs/shared/units'
import { Cache } from '@/libs/shared/workflow'

type CacheMemoryOptions = {
  /**
   * If set to 'infinite', will never be invalidated
   * @default 5 hours
   */
  defaultTtl: Time | 'infinite'
}

const isDev = process.env.NODE_ENV !== 'production'

export class CacheMemory implements Cache {
  constructor(options?: Partial<CacheMemoryOptions>) {
    this._options = defu(options, {
      defaultTtl: Time(5, 'h'),
    })
  }

  memoize<T, R>(
    fnName: string,
    fn: (arg: T) => Promise<R>,
  ): (arg: T) => Promise<R> {
    const wrappedFn = async (arg: T): Promise<R> => {
      const key = CacheMemory._getMapKey(fnName, arg)

      if (this._map.has(key)) {
        if (isDev) {
          console.log('Taken from cache:', key)
        }

        return this._map.get(key) as R
      }

      if (isDev) {
        console.log('Cache miss:', key)
      }

      const result = await fn(arg)
      this._map.set(key, result)

      if (this._options.defaultTtl !== 'infinite') {
        setTimeout(
          () => this._map.delete(key),
          this._options.defaultTtl.in('ms'),
        )
      }

      return result
    }

    return wrappedFn
  }

  async invalidate(fnName: string): Promise<void> {
    for (const key of this._map.keys()) {
      const fnNameFromKey = CacheMemory._getFnNameFromKey(key)

      if (fnName === fnNameFromKey) {
        this._map.delete(key)
      }
    }
  }

  private _options: CacheMemoryOptions

  private _map = new Map<string, unknown>()

  private static readonly _delimeter = '//CACHE_DELIMETER//'

  private static _getMapKey(fnName: string, arg: unknown): string {
    return `${fnName}${CacheMemory._delimeter}${bjson.stringify(arg)}`
  }

  private static _getFnNameFromKey(key: string): string | undefined {
    return key.split(CacheMemory._delimeter).at(0)
  }
}
