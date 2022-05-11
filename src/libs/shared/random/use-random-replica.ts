import { getRandomFromArray } from './get-random-from-array'

type ReplicaOptions<Placeholder extends string> = {
  replicas: string[]
  placeholders: readonly Placeholder[]
}

type ReplicaResult<Placeholder extends string> = (
  placeholderRealValues?: Record<Placeholder, string>,
) => string

export const useRandomReplica =
  <Placeholder extends string>(
    options: ReplicaOptions<Placeholder>,
  ): ReplicaResult<Placeholder> =>
  placeholderRealValues => {
    const chosenReplica = getRandomFromArray(options.replicas)

    if (!placeholderRealValues) return chosenReplica

    return options.placeholders.reduce(
      (resultReplica: string, currentPlaceholder: Placeholder) =>
        resultReplica.replaceAll(
          `%${currentPlaceholder}%`,
          placeholderRealValues[currentPlaceholder],
        ),
      chosenReplica,
    )
  }
