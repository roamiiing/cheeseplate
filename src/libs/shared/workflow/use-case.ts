import { UseCaseContext } from './context'
import { Media } from './media'

export type UseCaseResult =
  | {
      message: string
    }
  | {
      gif: string
    }
  | {
      media: Media[]
    }

export type UseCase<Input> = (
  ctx: UseCaseContext<Input>,
) => Promise<UseCaseResult | undefined | null | void | never>
