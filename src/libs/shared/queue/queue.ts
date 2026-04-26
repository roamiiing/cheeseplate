export type QueuedFunction = () => Promise<unknown>

export interface Queue {
  /**
   * Resolves when `fn` has finished (StubQueue: immediately after `fn`;
   * PromiseQueue: after the job is actually run and completes successfully).
   */
  enqueue(
    key: number,
    fn: QueuedFunction,
    /**
     * Represents how much messages this one counts as
     * For example, when you send multiple pictures,
     * all of them are considered as separate images
     */
    countsAs?: number,
  ): Promise<void>
}
