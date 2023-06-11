export type ReleaseFn = () => void

export class Semaphore {
    private count = 0

    constructor(private readonly maxCount: number) {}

    public acquire(): ReleaseFn | null {
        if (this.count >= this.maxCount) {
            return null
        }

        this.count++
        return () => this._release()
    }

    private _release(): void {
        if (this.count <= 0) {
            return
        }

        this.count--
    }
}
