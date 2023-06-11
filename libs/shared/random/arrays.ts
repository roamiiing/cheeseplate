import { exists } from 'shared/guards'

export const getRandomFromArray = <T>(
    arr: T[],
    probabilities?: number[],
) => {
    if (!exists(probabilities)) {
        const index = Math.floor(Math.random() * arr.length)
        return arr[index]
    }

    const sum = probabilities.reduce((a, b) => a + b, 0)

    const mapped = probabilities.map((prob) => prob / sum)

    const rand = Math.random()

    let currentProb = 0

    for (let index = 0; index < arr.length; index++) {
        const prob = mapped[index]
        currentProb += prob
        if (rand < currentProb) return arr.at(index)
    }

    return arr.at(-1)
}
