import { Queue, QueuedFunction } from './queue'

// TODO: investigate on how not to get
// RPM errors in serverless env
export class StubQueue implements Queue {
  enqueue(_key: number, fn: QueuedFunction): void {
    fn()
  }
}
