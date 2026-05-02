import { Bot, type Context } from "grammy";
import { createDb, sqlitePathFromUrl } from "./db/client";
import { migrate } from "./db/migrate";
import { createCheeseHandlers, type HandlerResult } from "./handlers";
import { baseFetchConfig, proxyMode } from "./proxy";
import { CheeseRepository } from "./repository";
import { createRawTelegramTransformer, createTelemetry, trackIncomingUpdate, type Telemetry } from "./telemetry";

export function createBot(token: string, databaseUrl = process.env.DATABASE_URL ?? "file:./data/cheeseplate.sqlite", telemetry: Telemetry = createTelemetry({ project: "cheeseplate" })) {
  migrate(databaseUrl);
  const { db } = createDb(databaseUrl);
  const repo = new CheeseRepository(db);
  const handlers = createCheeseHandlers(repo);
  const fetchConfig = baseFetchConfig();
  const bot = new Bot(token, fetchConfig ? { client: { baseFetchConfig: fetchConfig } } : undefined);
  bot.api.config.use(createRawTelegramTransformer(telemetry, "cheeseplate-raw-tg"));

  bot.catch((error) => {
    console.error("Telegram update failed", {
      updateId: error.ctx.update.update_id,
      chatId: error.ctx.chat?.id,
      fromId: error.ctx.from?.id,
      error: error.error,
    });
  });

  bot.use(async (ctx, next) => {
    trackIncomingUpdate(telemetry, "cheeseplate-raw-tg", ctx.update);
    if (ctx.from && ctx.chat) {
      repo.upsertUser({
        telegramId: ctx.from.id,
        chatId: ctx.chat.id,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
      });
    }
    await next();
  });

  bot.command("settag", (ctx) => send(ctx, telemetry, handlers.setTag(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("deltag", (ctx) => send(ctx, telemetry, handlers.deleteTag(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("dryping", (ctx) => send(ctx, telemetry, handlers.dryPing(ctx.message?.text ?? "", ctx.chat.id)));
  bot.command("taglist", (ctx) => send(ctx, telemetry, handlers.tagList(ctx.chat.id)));
  bot.command("setname", (ctx) => send(ctx, telemetry, handlers.setName(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("about", (ctx) =>
    send(
      ctx,
      telemetry,
      handlers.about({
        text: ctx.message?.text,
        chatId: ctx.chat.id,
        fromId: ctx.from!.id,
        replyToUserId: ctx.message?.reply_to_message?.from?.id,
        entities: ctx.message?.entities,
      }),
    ),
  );
  bot.command("roll", (ctx) => send(ctx, telemetry, handlers.roll(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("pick", (ctx) => send(ctx, telemetry, handlers.pick(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("ben", (ctx) => send(ctx, telemetry, handlers.ben(ctx.chat.id, ctx.from!.id)));
  bot.command("help", (ctx) => send(ctx, telemetry, handlers.help(ctx.chat.id, ctx.from!.id)));
  bot.command("__debug", (ctx) => send(ctx, telemetry, handlers.debug(ctx.chat.id, ctx.from!.id, ctx.chat.type, sqlitePathFromUrl(databaseUrl), proxyMode())));

  bot.on(["message:text", "message:caption"], (ctx) =>
    send(
      ctx,
      telemetry,
      handlers.pingFromMessage({
        text: ctx.message.text,
        caption: ctx.message.caption,
        chatId: ctx.chat.id,
        fromId: ctx.from!.id,
      }),
    ),
  );

  return bot;
}

export async function send(ctx: Context, telemetry: Telemetry, result: HandlerResult) {
  for (const event of result.events) telemetry.track(event.name, event.data);
  const reply = result.reply;
  if (!reply) return;
  if (reply.gif) {
    await ctx.replyWithAnimation(reply.gif);
    return;
  }
  if (reply.text) {
    await ctx.reply(reply.text, {
      parse_mode: "HTML",
      disable_notification: reply.notify ? false : true,
      link_preview_options: { is_disabled: true },
    });
  }
}
