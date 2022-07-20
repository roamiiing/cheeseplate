const path = require('path')

const getAppConfig = ({ name, features }) => ({
  name: name,
  script: path.resolve(__dirname, 'dist', 'index.js'),
  env: {
    NODE_ENV: 'production',
    ENV_FILE_PATH: path.resolve(__dirname, 'env', `${name}.env`),
    FEATURES_MASK: features.toString(),
  },
})

module.exports = {
  apps: [
    {
      name: 'cheeseplate-main',
      features: 0b011110,
    },
    {
      name: 'cheeseplate-neuro',
      features: 0b100000,
    },
  ].map(getAppConfig),
}
