import { getRandomFromArray } from '@/libs/shared/random'
import { UseCase } from '@/libs/shared/workflow'

const BEN_GIFS = [
  'https://c.tenor.com/eW6zRrKEuIYAAAAC/yes-ben.gif', // yes
  'https://c.tenor.com/Cziub06OwxgAAAAC/ben.gif', // hohoho
  'https://c.tenor.com/DW_G9zcpdF4AAAAC/ben.gif', // no
  'https://c.tenor.com/Vh28wO-oya4AAAAC/ugh-ben.gif', // ugh
]

export const BEN_COMMAND = '/ben'

export type BenInput = void

export const benUseCase = (): UseCase<BenInput> => async () => {
  const gif = getRandomFromArray(BEN_GIFS)

  return { gif }
}
