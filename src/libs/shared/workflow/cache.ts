export interface Cache {
  memoize<T, R>(
    fnName: string,
    fn: (arg: T) => Promise<R>,
  ): (arg: T) => Promise<R>

  invalidate(fnName: string): Promise<void>
}
