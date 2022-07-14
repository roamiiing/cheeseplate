import { UseCaseContext } from './context'
import { Media } from './media'

export type UseCaseResultOptions = {
  notify?: boolean
}

export type UseCaseResult = (
  | {
      message: string
    }
  | {
      gif: string
    }
  | {
      media: Media[]
    }
) & {
  options?: UseCaseResultOptions
}

export type UseCase<Input> = (
  ctx: UseCaseContext<Input>,
) => Promise<UseCaseResult | undefined | null | void | never>
