import { useRandomReplica } from '@/libs/shared/random'
import { useReplica } from '@/libs/shared/strings'

export const successfullyRemoveReplica = useRandomReplica({
  replicas: [
    'Ты больше не <s>титан</s> <b>%tag%</b> 🕶',
    'Окей, с позором вышвыриваем из секты <b>%tag%</b> 🤬️',
    'Клуб <b>%tag%</b> сказал bye-bye? Не переживай, с клубом <s>рукожопов</s> ты всегда на своем месте 🤡',
    'Может после отказа от <b>%tag%</b>, ты всё-таки выберешь веревку, мыло, и старую табуретку?????? 🤪',
    'Ой, больно надо, чмоня. Как будто уж больно нужен <b>%tag%</b> 🤢',
    'Знаешь что делают на западе с теми, кто отказывается от <b>%tag%</b>? 🤐',
    'Нет слов, одни эмоции, <b>%tag%</b> покинул твой списочек 💅',
  ],
  placeholders: ['tag'],
})

export const hadNotThisTagReplica = useReplica({
  replica: 'У тебя не было тега <b>%tag%</b>',
  placeholders: ['tag'],
})

export const drypingReplica = useRandomReplica({
  replicas: [
    'Эти великолепные люди получат уведомление 🗡: <b>%data%</b>',
    'Эта секта состоит из этих прекрасных человеков ⛪️: <b>%data%</b>',
    'Ну этих дурашек можно по пальцам пересчитать 🤯: <b>%data%</b>',
    'По этому тегу будут призваны 🪖: <b>%data%</b>',
    'Так ты можешь призвать их 😱: <b>%data%</b>',
    'Вот этот списочек будет пушнут 🤓: <b>%data%</b>',
  ],
  placeholders: ['data'],
})

export const pingReplica = useRandomReplica({
  replicas: [
    '🪖 Призываю вас <b>%data%</b>',
    'Хаха, ну вот и до вас добрались, <b>%data%</b> 🚔',
    '<b>%data%</b>, вам пришло новое сообщение. Посмотри, вдруг там что-то важное 😉',
    'Рота подъем! <b>%data%</b> 🎖️',
    'Вас кто-то тегнул!!! <b>%data%</b> 😝',
    'АЛЯРМ! <b>%data%</b> 🚨',
    'console.warn("Vas tegnuli, <b>%data%</b> 🙈")',
  ],
  placeholders: ['data'],
})

export const noSuchUsersReplica = useReplica({
  replica: 'Нет юзеров с такими тегами',
})

export const successfulySetReplica = useRandomReplica({
  replicas: [
    'Теперь ты <s>титан</s> <b>%tag%</b> 🗡',
    'Понял, записал вас в секту <b>%tag%</b> ✝️',
    'Променял клуб <s>рукожопов</s> на клуб <b>%tag%</b> 🍑',
    'Таким как ты я обычно советую выбрать верёвку и мыло, но, к сожалению, сегодня это <b>%tag%</b> 😭',
    '<b>%tag%</b>?! Это что-то новенькое 🤔',
    'Не знаю как ты, а я считаю что любить <b>%tag%</b> - опасно 😰',
    'Ого, ты теперь с <b>%tag%</b>, это так заводит 🥵🚙',
    'Эй, дружок-пирожок, тобой выбрана неправильная дверь, кружок любителей <b>%tag%</b> два блока вниз, впрочем, мне что-ли decide какие an*l slaves тебя на это вынудили 🤐',
  ],
  placeholders: ['tag'],
})

export const reservedTagReplica = useReplica({
  replica: 'Это зарезервированный тег',
})

export const alreadyHasTagReplica = useReplica({
  replica: 'У тебя уже есть тег %tag%',
  placeholders: ['tag'],
})
