type PriorityItem<F extends Function> = {
  fn: F
  priority?: number
}

export class PriorityBuilder<F extends Function = Function> {
  private items: PriorityItem<F>[] = []

  add(fn: F, options?: Omit<PriorityItem<F>, 'fn'>) {
    const { priority } = options ?? {}

    this.items.push({
      fn,
      priority,
    })

    return this
  }

  run() {
    this.items
      .sort(({ priority: a = 0 }, { priority: b = 0 }) => b - a)
      .forEach(({ fn }) => fn())
  }
}

export const createPriorityBuilder = <F extends Function>() =>
  new PriorityBuilder()
