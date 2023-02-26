import { getRandomFromArray } from '@/libs/shared/random'

const BEN_GIFS = [
  'https://c.tenor.com/eW6zRrKEuIYAAAAC/yes-ben.gif', // yes
  'https://c.tenor.com/DW_G9zcpdF4AAAAC/ben.gif', // no
  'https://c.tenor.com/Cziub06OwxgAAAAC/ben.gif', // hohoho
  'https://c.tenor.com/Vh28wO-oya4AAAAC/ugh-ben.gif', // ugh
  'https://c.tenor.com/hdPVLfpe81cAAAAC/talking-ben-drinking.gif', // drinking
]

const GIFS_PROBABILITIES = [0.47, 0.47, 0.02, 0.02, 0.02]

export type BenUseCase = () => Promise<{ gif: string }>

export const benUseCase = (): BenUseCase => async () => {
  const gif = getRandomFromArray(BEN_GIFS, GIFS_PROBABILITIES)

  return {
    gif,
  }
}
