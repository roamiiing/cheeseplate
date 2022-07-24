import { ReplicaResult, useReplica } from '@/libs/shared/strings'

import { getRandomFromArray } from './get-random-from-array'

type RandomReplicaOptions<Placeholder extends string> = {
  replicas: string[]
  placeholders?: readonly Placeholder[]
}

export const useRandomReplica =
  <Placeholder extends string>({
    replicas,
    placeholders = [],
  }: RandomReplicaOptions<Placeholder>): ReplicaResult<Placeholder> =>
  placeholderRealValues => {
    const replica = getRandomFromArray(replicas)

    return useReplica({
      replica,
      placeholders,
    })(placeholderRealValues)
  }
