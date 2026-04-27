import { Bot, type Context } from "grammy";
import { createDb, sqlitePathFromUrl } from "./db/client";
import { migrate } from "./db/migrate";
import { createCheeseHandlers, type Reply } from "./handlers";
import { baseFetchConfig, proxyMode } from "./proxy";
import { CheeseRepository } from "./repository";

export function createBot(token: string, databaseUrl = process.env.DATABASE_URL ?? "file:./data/cheeseplate.sqlite") {
  migrate(databaseUrl);
  const { db } = createDb(databaseUrl);
  const repo = new CheeseRepository(db);
  const handlers = createCheeseHandlers(repo);
  const fetchConfig = baseFetchConfig();
  const bot = new Bot(token, fetchConfig ? { client: { baseFetchConfig: fetchConfig } } : undefined);

  bot.catch((error) => {
    console.error("Telegram update failed", {
      updateId: error.ctx.update.update_id,
      chatId: error.ctx.chat?.id,
      fromId: error.ctx.from?.id,
      error: error.error,
    });
  });

  bot.use(async (ctx, next) => {
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

  bot.command("settag", (ctx) => send(ctx, handlers.setTag(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("deltag", (ctx) => send(ctx, handlers.deleteTag(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("dryping", (ctx) => send(ctx, handlers.dryPing(ctx.message?.text ?? "", ctx.chat.id)));
  bot.command("taglist", (ctx) => send(ctx, handlers.tagList(ctx.chat.id)));
  bot.command("setname", (ctx) => send(ctx, handlers.setName(ctx.message?.text ?? "", ctx.chat.id, ctx.from!.id)));
  bot.command("about", (ctx) =>
    send(
      ctx,
      handlers.about({
        text: ctx.message?.text,
        chatId: ctx.chat.id,
        fromId: ctx.from!.id,
        replyToUserId: ctx.message?.reply_to_message?.from?.id,
        entities: ctx.message?.entities,
      }),
    ),
  );
  bot.command("roll", (ctx) => send(ctx, handlers.roll(ctx.message?.text ?? "")));
  bot.command("pick", (ctx) => send(ctx, handlers.pick(ctx.message?.text ?? "")));
  bot.command("ben", (ctx) => send(ctx, handlers.ben()));
  bot.command("help", (ctx) => send(ctx, handlers.help()));
  bot.command("__debug", (ctx) => send(ctx, handlers.debug(ctx.chat.id, ctx.chat.type, sqlitePathFromUrl(databaseUrl), proxyMode())));

  bot.on(["message:text", "message:caption"], (ctx) =>
    send(
      ctx,
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

async function send(ctx: Context, reply: Reply | undefined) {
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
