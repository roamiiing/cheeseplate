export const getRandomFromArray = <T>(
  arr: Array<T>,
  probabilities?: Array<number>,
) => {
  if (!probabilities) {
    const index = Math.floor(Math.random() * arr.length)
    return arr[index]
  }

  const sum = probabilities.reduce((a, b) => a + b, 0)

  const mapped = probabilities.map(prob => prob / sum)

  const rand = Math.random()

  let currentProb: number = 0
  for (const index in mapped) {
    currentProb += mapped[index]

    if (rand < currentProb) return arr[index]
  }

  return arr[arr.length - 1]
}
