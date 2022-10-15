import { captureException } from '@sentry/node'

import { Time, time } from '@/libs/shared/math'

import { Queue, QueuedFunction } from './queue'

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

export class PromiseQueue implements Queue {
  private static _window = time(1, 'm')

  private readonly _options: QueueOptions = {
    overallRpm: 30,
    specialRpm: 30,
    overallRps: 30,
    specialRps: 1,
  }

  private _retryTime = new Date(Date.now())

  private readonly _history: History = []
  private readonly _queue: QueuedElement[] = []

  constructor(_options?: Partial<QueueOptions>) {
    if (_options?.overallRpm) {
      this._options.overallRpm = _options.overallRpm
    }

    if (_options?.specialRpm) {
      this._options.specialRpm = _options.specialRpm
    }

    this._initCounter()
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
    console.log('Adding', key, 'to queue!')
    this._queue.push({
      key,
      fn,
      countsAs,
    })
  }

  private _isSafeNow(key: number) {
    const now = Date.now()

    if (now < this._retryTime.getTime()) {
      return false
    }

    const isSpecial = (v: HistoryItem) => v.key === key

    const isInLastMinute = (then: Date) =>
      now - then.getTime() <= time(1, 'm').in('ms')

    const isInLastSecond = (then: Date) =>
      now - then.getTime() <= time(1, 's').in('ms')

    const overall = this._history.filter(v => isInLastMinute(v.madeAt))
    const special = overall.filter(isSpecial)

    const overallInLastSecond = overall.filter(v => isInLastSecond(v.madeAt))
    const specialInLastSecond = overallInLastSecond.filter(isSpecial)

    return (
      overall.length < this._options.overallRpm &&
      special.length < this._options.specialRpm &&
      overallInLastSecond.length < this._options.overallRps &&
      specialInLastSecond.length < this._options.specialRps
    )
  }

  private async _initCounter() {
    const promiseFn = async () => {
      const firstUniques = Object.values(
        this._queue.reduce((acc, val) => {
          if (!acc[val.key]) acc[val.key] = val
          return acc
        }, {} as Record<number, QueuedElement>),
      )

      await Promise.all(
        firstUniques.map(v => {
          if (this._isSafeNow(v.key)) {
            console.log('Safe', v.key)
            return v
              .fn()
              .then(() => {
                console.log('Did fn', v.key)
                const item = {
                  key: v.key,
                  madeAt: new Date(),
                }

                this._history.push(...Array(v.countsAs).fill(item))

                this._queue.splice(
                  this._queue.findIndex(p => p === v),
                  1,
                )

                setTimeout(() => {
                  this._history.splice(
                    this._history.findIndex(_item => item === _item),
                    1,
                  )
                }, PromiseQueue._window.in('ms'))
              })
              .catch(e => {
                if (e instanceof QueueError) {
                  this._retryTime = new Date(
                    Math.max(
                      Date.now() +
                        e.retryAfter.in('ms') +
                        time(1, 's').in('ms'),
                      this._retryTime.getTime(),
                    ),
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await promiseFn()
      await new Promise(res => setTimeout(res, 100))
    }
  }
}
