import { useRandomReplica } from '@/libs/shared/random'

export const rollReplica = useRandomReplica({
  replicas: [
    'Вангую, что %message% с вероятностью %prob%% 🔮',
    'Наш сенсей сделает харакири своей катаной в любом случае 🍣. А вот ваше "%message%" — %prob%%',
    'Пока ниндзя 🥷🏻 на кухне варит мисо-суп 🍜, шанс, что %message% равен %prob%%',
    'Пока наш квартирный рембо надеется, что он сможет избить нунчаками стену, мы посчитали, что %message% произойдет в %fraction% 🧮',
    'Наша ручная якудза считает, что %message% будет с вероятностью %prob%% 🥷🏻',
  ],
  placeholders: ['message', 'prob', 'fraction'],
})
