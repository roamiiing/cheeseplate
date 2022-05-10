# circles-essentials-bot

Это бот с жизненно-необходимыми командами для телеги.

## Запуск и локальное тестирование

Перед всеми шагами выполняем `nvm use && npm ci`

1. Создаем бота в телеге
2. `cp .env.sample .env` и прописываем там свой токен (урл для призмы не
   трогаем)
3. В папке docker лежит docker-compose с postgre. Запускаем:
   `cd docker && docker-compose up -d`
4. Ждем несколько секунд пока постгре очнется
5. `npm run prisma migrate deploy` - это применит миграции призмы в локальной бд
6. `npm run dev` - запуск бота
7. В другой вкладке запускаем prisma studio: `npm run prisma studio`
8. Идем в личку с ботом и прописываем `/__debug`, получаем ID чатика
9. ID чатика копируем, идем в Prisma Studio и создаем Chat с этим айдишником
10. Готово, можно писать боту и тестить его локально

## Деплой

TODO: автоматизировать, CI/CD

1. `pm2 stop circles-essentials-bot`
2. `npm run prisma migrate deploy`
3. `npm run prisma generate`
4. `npm run build`
5. `pm2 start`
