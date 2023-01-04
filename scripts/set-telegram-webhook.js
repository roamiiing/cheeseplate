const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const { Telegraf } = require('telegraf')

;(async () => {
  const { argv } = yargs(hideBin(process.argv))

  const { token, url } = await argv

  if (!token) {
    return console.log('Token is required')
  }

  if (!url) {
    return console.log('URL is required')
  }

  new Telegraf(token).telegram.setWebhook(url)
})()
