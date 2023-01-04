import { RugptPrompt, postProcessRugptResult } from '@/libs/neuro/domain'
import { Semaphore } from '@/libs/shared/workflow'

export type RugptDeps = {
  requestRugptText: (prompt: string) => Promise<string>
  rugptSemaphore: Semaphore
}

export const enum RugptStatus {
  Wait,
  UnderLoad,
  Text,
}

export type RugptOutput =
  | { status: RugptStatus.Wait }
  | { status: RugptStatus.UnderLoad }
  | { status: RugptStatus.Text; text: string }

export type RugptUseCase = (
  prompt: RugptPrompt,
) => AsyncGenerator<RugptOutput, void, void>

export const rugptUseCase = ({
  requestRugptText,
  rugptSemaphore,
}: RugptDeps): RugptUseCase =>
  async function* rugptUseCase(prompt: RugptPrompt) {
    const release = rugptSemaphore.acquire()

    if (!release) {
      return yield { status: RugptStatus.UnderLoad }
    }

    yield { status: RugptStatus.Wait }

    const text = await requestRugptText(prompt)
      .then(postProcessRugptResult)
      .finally(release)

    yield { status: RugptStatus.Text, text }
  }
