import { getRandomFromArray } from '@/libs/shared/random'
import { escapeAll } from '@/libs/shared/strings'

export type LocaleArgument = string | number

export interface LocaleStore {
  /**
   * Get a localized string. This operation escapes any HTML in the args.
   * @param key - The key of the string to get. If the key is not found, the key itself will be
   * returned as the string. Also supports nested keys, e.g. 'foo.bar.baz'
   * @param args - Arguments to be interpolated into the string
   * @returns The localized string
   */
  get(key: string, ...args: LocaleArgument[]): string

  getRaw(key: string, ...args: LocaleArgument[]): string
}

export type LocaleStoreJson = {
  [key: string]: string | string[] | LocaleStoreJson
}

export class LocaleStoreImpl implements LocaleStore {
  public get(key: string, ...args: LocaleArgument[]): string {
    return this.getRaw(
      key,
      ...args.map(arg => (typeof arg === 'string' ? escapeAll(arg) : arg)),
    )
  }

  public getRaw(key: string, ...args: LocaleArgument[]): string {
    const value = this._store[key]

    if (value === undefined) {
      return key
    }

    if (typeof value === 'string') {
      return this._replace(value, args)
    }

    return this._replace(getRandomFromArray(value), args)
  }

  public load(json: LocaleStoreJson): LocaleStoreImpl {
    const flatten = (
      obj: LocaleStoreJson,
      path: string[] = [],
    ): Record<string, string | string[]> => {
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key]
        const newPath = [...path, key]

        if (typeof value === 'string' || Array.isArray(value)) {
          return {
            ...acc,
            [newPath.join('.')]: value,
          }
        }

        return {
          ...acc,
          ...flatten(value, newPath),
        }
      }, {})
    }

    this._store = {
      ...this._store,
      ...flatten(json),
    }

    return this
  }

  private _store: Record<string, string | string[]> = {}

  private _replace(template: string, values: LocaleArgument[]): string {
    return template.replace(/{(\d+)}/g, (match, index) => {
      return values[index] === undefined ? match : values[index].toString()
    })
  }
}
