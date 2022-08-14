import { useRandomReplica } from '@/libs/shared/random'

export const waitDalleReplica = useRandomReplica({
  replicas: [
    'Секунд очку.. <i>%prompt%</i> уже на подходе ⏳',
    '<i>%prompt%</i>? А ты хорош) Ожидай 🤯',
    'Вау, мне тоже интересно как выглядит <i>%prompt%</i> 🔮',
    'Еще Боги Олимпа 🏛 думали чем озадачить великих художников. Но времена меняются, рисовать <i>%prompt%</i> будут не Великие художники, а DALL-E, хотя и спрашивают не то чтобы Боги... 🤢',
  ],
  placeholders: ['prompt'],
})

export const problemsDalleReplica = useRandomReplica({
  replicas: [
    'Проблемы с Dalle, приходи позже 🥲',
    'Кажется Dalle умерла, подожди и попробуй еще раз 🤧',
  ],
})

export const waitGptReplica = useRandomReplica({
  replicas: [
    '<i>%prompt%</i>? Хм, ну посмотрим, что может <s>выср...</s> выдать ruGPT 😉',
    'Говорят что ruGPT может заместить целый штат редакторов в СМИ! 😱 Но давайте посмотрим, как он справится с <i>%prompt%</i>',
  ],
  placeholders: ['prompt'],
})

export const problemsGptReplica = useRandomReplica({
  replicas: [
    'Как и большинство русских 🇷🇺 технологий (и не только), ruGPT не очень любит работать. Приходи позже(',
  ],
})
