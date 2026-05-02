import { z } from "zod";
import type { Random } from "../random";
import type { CheeseRepository, UserWithTags } from "../repository";
import { commandArgs, escapeHtml } from "../text";
import { fill, replica, userReplicas } from "./replicas";
import { replyResult, type HandlerResult } from "./types";
import type { MessageInput } from "./types";

const nameSchema = z
  .string({ required_error: "Не указано имя" })
  .min(2, "Слишком короткое имя, минимум 2 символа")
  .max(20, "Слишком длинное имя, максимум 20 символов")
  .regex(/^[\wа-яё]+$/iu, "Имя может содержать только кириллицу, латиницу, цифры и _");

export function setName(repo: CheeseRepository, random: Random, text: string, chatId: number, fromId: number): HandlerResult {
  const displayName = commandArgs(text);
  const event = (data: Record<string, unknown>) => ({ name: "display_name_set_requested", data: { chatId, fromId, displayName, nameLength: displayName.length, ...data } });
  const parsed = nameSchema.safeParse(displayName || undefined);
  if (!parsed.success) return replyResult({ text: parsed.error.issues[0]!.message }, [event({ valid: false, rejectedReason: parsed.error.issues[0]!.message, alreadyExists: false, changed: false })]);
  const { alreadyExists } = repo.setDisplayName(fromId, chatId, parsed.data);
  return replyResult(
    {
      text: alreadyExists
        ? fill("Пользователь с именем %displayName% уже есть", { displayName: escapeHtml(parsed.data) })
        : replica(random, userReplicas.changed, { displayName: escapeHtml(parsed.data) }),
    },
    [event({ valid: true, rejectedReason: null, alreadyExists, changed: !alreadyExists })],
  );
}

export function about(repo: CheeseRepository, random: Random, input: MessageInput): HandlerResult {
  const text = input.text ?? "";
  const arg = commandArgs(text);
  const textMention = input.entities?.find((entity) => entity.type === "text_mention" && entity.user?.id);
  const mention = input.entities?.find((entity) => entity.type === "mention" && entity.offset > 0);
  const mentionText = mention ? text.slice(mention.offset, mention.offset + mention.length) : undefined;
  const lookupMethod = textMention?.user?.id !== undefined ? "text_mention" : mentionText ? "username" : arg ? "display_name" : input.replyToUserId ? "reply" : "self";
  const lookupValue = textMention?.user?.id !== undefined ? textMention.user.id : mentionText ? mentionText : arg ? arg : input.replyToUserId ? input.replyToUserId : input.fromId;
  const user =
    textMention?.user?.id !== undefined
      ? repo.getUserWithTags(repo.getUser(textMention.user.id, input.chatId))
      : mentionText
        ? repo.getUserWithTags(repo.getUserByUsername(mentionText, input.chatId))
        : arg
          ? repo.getUserWithTags(repo.getUserByDisplayName(arg, input.chatId))
          : input.replyToUserId
            ? repo.getUserWithTags(repo.getUser(input.replyToUserId, input.chatId))
            : repo.getUserWithTags(repo.getUser(input.fromId, input.chatId));
  return replyResult({ text: renderAbout(random, user) }, [
    {
      name: "user_about_requested",
      data: {
        chatId: input.chatId,
        fromId: input.fromId,
        lookupMethod,
        lookupValue,
        found: user !== undefined,
        targetTelegramId: user?.telegramId ?? null,
        targetDisplayName: user?.displayName ?? null,
        targetTagCount: user?.tagList.length ?? 0,
      },
    },
  ]);
}

function renderAbout(random: Random, user: UserWithTags | undefined) {
  if (!user) return "Пользователь не найден";
  const link = user.telegramUsername ? `https://t.me/${escapeHtml(user.telegramUsername)}` : `tg://user?id=${user.telegramId}`;
  const tags = user.tagList.length ? user.tagList.map((tag) => `#${escapeHtml(tag)}`).join(", ") : replica(random, userReplicas.noTags);
  return [
    replica(random, userReplicas.about, { username: `<b>${escapeHtml(user.displayName)}</b>` }),
    `Telegram: <a href="${link}">${escapeHtml(user.telegramUsername ? `@${user.telegramUsername}` : String(user.telegramId))}</a>`,
    `Теги: ${tags}`,
  ].join("\n");
}
