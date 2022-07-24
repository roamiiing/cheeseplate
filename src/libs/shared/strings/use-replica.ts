import { escapeHtml } from './escape-html'

type ReplicaOptions<Placeholder extends string> = {
  replica: string
  placeholders?: readonly Placeholder[]
}

export type ReplicaResult<Placeholder extends string> = (
  placeholderRealValues?: Record<Placeholder, string>,
  options?: {
    escape?: boolean
  },
) => string

export const useReplica =
  <Placeholder extends string>({
    replica,
    placeholders = [],
  }: ReplicaOptions<Placeholder>): ReplicaResult<Placeholder> =>
  (placeholderRealValues, options = { escape: true }) => {
    if (!placeholderRealValues) return replica

    return placeholders.reduce(
      (resultReplica: string, currentPlaceholder: Placeholder) =>
        resultReplica.replaceAll(
          `%${currentPlaceholder}%`,
          options.escape !== undefined && !options.escape
            ? placeholderRealValues[currentPlaceholder]
            : escapeHtml(placeholderRealValues[currentPlaceholder]),
        ),
      replica,
    )
  }
