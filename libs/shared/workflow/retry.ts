export type RetryOptions = {
    retries?: number
    delayMs?: number
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const retryUntil = async <T, E>(
    fn: () => Promise<T>,
    until: (result: T) => boolean,
    { retries = 3, delayMs = 1000 }: RetryOptions = {},
): Promise<T> => {
    try {
        const result = await fn()

        if (until(result)) return result

        if (retries === 0) throw new Error('Retry limit reached')
    } catch (error) {
        if (retries === 0) throw error
    }

    await sleep(delayMs)

    return await retryUntil(fn, until, {
        retries: retries - 1,
        delayMs,
    })
}
