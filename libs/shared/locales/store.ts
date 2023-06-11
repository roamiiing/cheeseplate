export type LocaleArguments = string | number | boolean | LocaleArguments[] | {
    [_: string]: LocaleArguments
}

export interface LocaleStore {
    /**
     * Get a localized string. This operation escapes any HTML in the args.
     * @param key - The key of the string to get. If the key is not found, the key itself will be
     * returned as the string. Also supports nested keys, e.g. 'foo.bar.baz'
     * @param args - Arguments to be interpolated into the string
     * @returns The localized string
     */
    get(key: string, args?: LocaleArguments): string

    getRaw(key: string, args?: LocaleArguments): string
}
