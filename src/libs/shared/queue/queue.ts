export type QueuedFunction = () => Promise<unknown>

export interface Queue {
  enqueue(
    key: number,
    fn: QueuedFunction,
    /**
     * Represents how much messages this one counts as
     * For example, when you send multiple pictures,
     * all of them are considered as separate images
     */
    countsAs?: number,
  ): void
}
