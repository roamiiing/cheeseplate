export type ReleaseFn = () => void

export class Semaphore {
  private _count = 0

  constructor(private readonly _maxCount: number) {}

  public acquire(): ReleaseFn | null {
    if (this._count >= this._maxCount) {
      return null
    }

    this._count++
    return () => this._release()
  }

  private _release(): void {
    if (this._count <= 0) {
      return
    }

    this._count--
  }
}
