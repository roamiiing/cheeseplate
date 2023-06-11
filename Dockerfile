FROM denoland/deno:alpine-1.34.2

WORKDIR /app

COPY . .

RUN deno cache apps/cheeseplate/main.ts

CMD ["deno", "task", "start"]
