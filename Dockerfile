FROM node:16-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build:bot

RUN npm prune --production

ENV NODE_ENV=production

RUN npx prisma generate

CMD ["/bin/sh", "-c", "npx prisma migrate deploy; node ./dist/bot/index.js"]
