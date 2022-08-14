type PriorityItem<F extends CallableFunction> = {
  fn: F
  priority?: number
}

export class PriorityBuilder<F extends CallableFunction = CallableFunction> {
  private _items: PriorityItem<F>[] = []

  add(fn: F, options?: Omit<PriorityItem<F>, 'fn'>) {
    const { priority } = options ?? {}

    this._items.push({
      fn,
      priority,
    })

    return this
  }

  run() {
    this._items
      .sort(({ priority: a = 0 }, { priority: b = 0 }) => b - a)
      .forEach(({ fn }) => fn())
  }
}

export const createPriorityBuilder = <F extends CallableFunction>() =>
  new PriorityBuilder<F>()
