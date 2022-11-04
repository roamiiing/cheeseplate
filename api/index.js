const { webhook } = require('../dist/serverless')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = async (req, res) => {
  webhook(req, res)
  await sleep(5000)
}
