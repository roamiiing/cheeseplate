const { prismaClient, webhook } = require('../dist/serverless')

module.exports = async (req, res) => {
  try {
    await webhook(req, res)
  } finally {
    await prismaClient.$disconnect().catch(() => {})
  }
}
