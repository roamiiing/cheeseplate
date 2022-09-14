import { defu } from 'defu'
import bjson from 'json-bigint'

import { Time } from '@/libs/shared/units'
import { Cache, CacheOptions } from '@/libs/shared/workflow'

const isDev = process.env.NODE_ENV !== 'production'

export class CacheMemory implements Cache {
  constructor(options?: Partial<CacheOptions>) {
    this._options = defu(options, {
      ttl: Time(5, 'h'),
    })
  }

  memoize<T, R>(
    fnName: string,
    fn: (arg: T) => Promise<R>,
    options?: Partial<CacheOptions>,
  ): (arg: T) => Promise<R> {
    const resultOptions = defu(options, this._options)

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

      if (resultOptions.ttl !== 'infinite') {
        setTimeout(() => this._map.delete(key), resultOptions.ttl.in('ms'))
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

  private _options: CacheOptions

  private _map = new Map<string, unknown>()

  private static readonly _delimeter = '//CACHE_DELIMETER//'

  private static _getMapKey(fnName: string, arg: unknown): string {
    return `${fnName}${CacheMemory._delimeter}${bjson.stringify(arg)}`
  }

  private static _getFnNameFromKey(key: string): string | undefined {
    return key.split(CacheMemory._delimeter).at(0)
  }
}
