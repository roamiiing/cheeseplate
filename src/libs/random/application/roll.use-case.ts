import { UseCase } from '@/libs/shared/workflow'
import { useRandomReplica } from '@/libs/shared/random'
import { gcd } from '@/libs/shared/math'

export const ROLL_COMMAND = '/roll'

export type RollInput = {
  message?: string
}
const rollReplica = useRandomReplica({
  replicas: [
    'Вангую, что %message% с вероятностью %prob%% 🔮',
    'Наш сенсей сделает харакири своей катаной в любом случае 🍣. А вот ваше "%message%" — %prob%%',
    'Пока ниндзя 🥷🏻 на кухне варит мисо-суп 🍜, шанс, что %message% равен %prob%%',
    'Пока наш квартирный рембо надеется, что он сможет избить нунчаками стену, мы посчитали, что %message% произойдет в %fraction% 🧮',
    'Наша ручная якудза считает, что %message% будет с вероятностью %prob%% 🥷🏻',
  ],
  placeholders: ['message', 'prob', 'fraction'],
})

export const rollUseCase =
  (): UseCase<RollInput> =>
  async ({ input: { message } }) => {
    const prob = Math.round(Math.random() * 100)

    const divider = gcd(prob, 100)
    const fraction = `${prob / divider} случаев из ${100 / divider}`

    if (!message) return { message: `${prob}%` }

    return {
      message: rollReplica({ message, prob: prob.toString(10), fraction }),
    }
  }
