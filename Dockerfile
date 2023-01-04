FROM node:16.17.0-buster-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build:bot

RUN npm prune --production

ENV NODE_ENV=production

CMD ["node", "./dist/bot/index.js"]