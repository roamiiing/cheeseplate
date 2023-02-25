import { UseCaseContext } from './context'
import { UseCaseResult } from './use-case'

/**
 * @deprecated
 *
 * Now it can only receive input once. Refactor this
 * to accept input via some magic `request()` function like following:
 *
 * ```ts
 * async function* myUseCase() {
 *   const input = await yield request('Give me some input')
 *
 *   const result = await someAction(input)
 *
 *   await yield respond({ message: result })
 * }
 * ```
 */
export type GeneratorUseCase<Input> = (
  ctx: UseCaseContext<Input>,
) => AsyncGenerator<UseCaseResult | undefined | null | void | never>
