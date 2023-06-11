export type CacheOptions = {
    /**
     * Time to live in ms
     * @default 60_000_000
     */
    ttl?: number
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
