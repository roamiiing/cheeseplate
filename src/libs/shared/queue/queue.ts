import { Time, time } from '@/libs/shared/math'
import { captureException } from '@sentry/node'

export type QueueOptions = {
  /**
   * RPM for the whole Telegram
   */
  overallRpm: number
  /**
   * RPM for a specific group only
   */
  specialRpm: number

  overallRps: number
  specialRps: number
}

export type QueuedFunction = () => Promise<unknown>

export type HistoryItem = {
  key: number
  madeAt: Date
}

type QueuedElement = {
  key: number
  countsAs: number
  fn: QueuedFunction
}

export type History = HistoryItem[]

export class QueueError extends Error {
  constructor(public readonly retryAfter: Time) {
    super()
  }
}

export class Queue {
  private static WINDOW = time(1, 'm')

  private readonly options: QueueOptions = {
    overallRpm: 20,
    specialRpm: 10,
    overallRps: 30,
    specialRps: 1,
  }

  private retryTime = new Date(Date.now())

  private readonly history: History = []
  private readonly queue: QueuedElement[] = []

  constructor(_options?: Partial<QueueOptions>) {
    if (_options?.overallRpm) {
      this.options.overallRpm = _options.overallRpm
    }

    if (_options?.specialRpm) {
      this.options.specialRpm = _options.specialRpm
    }

    this.initCounter()
  }

  enqueue(
    key: number,
    fn: QueuedFunction,
    /**
     * Represents how much messages this one counts as
     * For example, when you send multiple pictures,
     * all of them are considered as separate images
     */
    countsAs = 1,
  ) {
    this.queue.push({
      key,
      fn,
      countsAs,
    })
  }

  private isSafeNow(key: number) {
    const now = Date.now()

    if (now < this.retryTime.getTime()) {
      return false
    }

    const isSpecial = (v: HistoryItem) => v.key === key

    const isInLastMinute = (then: Date) =>
      now - then.getTime() <= time(1, 'm').in('ms')

    const isInLastSecond = (then: Date) =>
      now - then.getTime() <= time(1, 's').in('ms')

    const overall = this.history.filter(v => isInLastMinute(v.madeAt))
    const special = overall.filter(isSpecial)

    const overallInLastSecond = overall.filter(v => isInLastSecond(v.madeAt))
    const specialInLastSecond = overallInLastSecond.filter(isSpecial)

    return (
      overall.length < this.options.overallRpm &&
      special.length < this.options.specialRpm &&
      overallInLastSecond.length < this.options.overallRps &&
      specialInLastSecond.length < this.options.specialRps
    )
  }

  private async initCounter() {
    const promiseFn = async () => {
      const firstUniques = Object.values(
        this.queue.reduce((acc, val) => {
          if (!acc[val.key]) acc[val.key] = val
          return acc
        }, {} as Record<number, QueuedElement>),
      )

      await Promise.all(
        firstUniques.map((v, i) => {
          if (this.isSafeNow(v.key)) {
            return v
              .fn()
              .then(() => {
                const item = {
                  key: v.key,
                  madeAt: new Date(),
                }

                this.history.push(...Array(v.countsAs).fill(item))

                this.queue.splice(
                  this.queue.findIndex(p => p === v),
                  1,
                )

                setTimeout(() => {
                  this.history.splice(
                    this.history.findIndex(_item => item === _item),
                    1,
                  )
                }, Queue.WINDOW.in('ms'))
              })
              .catch(e => {
                if (e instanceof QueueError) {
                  this.retryTime = new Date(
                    Date.now() + e.retryAfter.in('ms') + time(1, 's').in('ms'),
                  )
                } else {
                  console.error('Could not send message:', e)
                  captureException(e)
                }
              })
          } else {
            return Promise.resolve()
          }
        }),
      )
    }

    // TODO: refactor nicely
    while (true) {
      await promiseFn()
      await new Promise(res => setTimeout(res, 100))
    }
  }
}
