import { useRandomReplica } from '@/libs/shared/random'
import { useReplica } from '@/libs/shared/strings'

export const userInfoReplica = useRandomReplica({
  replicas: ['Инфа о юзере %username% 👻', 'Инфа о юзвере %username% 🐗'],
  placeholders: ['username'],
})

export const noTelegramNicknameReplica = useRandomReplica({
  replicas: [
    'Нет никнейма в Telegram 🙄',
    'Ссылочка на пользователя потерялась :(',
    'Странный чел, без ника... 🙄',
  ],
})

export const noTagsReplica = useRandomReplica({
  replicas: ['Нет тегов', 'Теги еще не указаны', 'Теги: пусто :('],
})

export const successfulChangeReplica = useRandomReplica({
  replicas: [
    'Теперь я буду звать вас %displayName% 👻',
    'Какое красивое имя - %displayName%! 🌸',
    '%displayName%... А что, звучит со вкусом! 🥵',
    '%displayName%? Мда... Ты долго думал?.. 🙄',
  ],
  placeholders: ['displayName'],
})

export const alreadyExistsReplica = useReplica({
  replica: 'Пользователь с именем %displayName% уже есть',
  placeholders: ['displayName'],
})
