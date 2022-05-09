import { config } from 'dotenv'

config()

import { appContainer } from './container'

appContainer.cradle.bot.command('/__debug', ctx => {
  ctx.replyWithHTML('<b>Инфа о чате</b>')
  ctx.replyWithHTML('<pre>' + JSON.stringify(ctx.chat, null, 2) + '</pre>')
})

// TODO: вынести middlewares в соответствующие ограниченные контексты
appContainer.cradle.bot.use(async (ctx, next) => {
  const chatId = ctx.message?.chat.id

  const exists = await appContainer.cradle.prismaClient.chat.findUnique({
    where: {
      telegramId: chatId,
    },
  })

  if (exists) {
    return next()
  }
})

appContainer.cradle.bot.command('/help', ctx => {
  const commands = [
    {
      command: 'agree',
      description:
        'Начать работу с ботом. После этого вы будете зарегистрированы в системе бота',
    },
    {
      command: 'disagree',
      description: 'Удалить себя из системы бота',
    },
    {
      command: 'settag',
      description:
        'Установить себе тег. Теги могут содержать только латиницу, кириллицу, а также цифры и _. После этого вас можно будет пинговать через <pre>#amogus</pre>',
      example: '/settag amogus',
    },
    {
      command: 'deltag',
      description: 'Снять с себя тег, добавленный ранее',
      example: '/deltag amogus',
    },
    {
      command: 'setname',
      description: 'Переименоваться',
      example: '/setname aboba',
    },
    {
      command: 'taglist',
      description: 'Посмотреть все свои теги',
    },
  ]

  ctx.replyWithHTML(
    `
<b>Список доступных команд:</b>

${commands
  .map(
    cmd =>
      `- /${cmd.command}: ${cmd.description}${
        cmd.example ? ` (${cmd.example})` : ''
      }`,
  )
  .join('\n')}
`,
  )
})

appContainer.cradle.configureUsers()
appContainer.cradle.configureTags()

appContainer.cradle.bot.catch((err, ctx) => {
  console.log(err, ctx)
})

appContainer.cradle.bot.launch()

console.log('Bot started')

process.once('SIGINT', () => appContainer.cradle.bot.stop('SIGINT'))
process.once('SIGTERM', () => appContainer.cradle.bot.stop('SIGTERM'))
