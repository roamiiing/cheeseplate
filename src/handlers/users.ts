import { z } from "zod";
import type { Random } from "../random";
import type { CheeseRepository, UserWithTags } from "../repository";
import { commandArgs, escapeHtml } from "../text";
import { fill, replica, userReplicas } from "./replicas";
import type { MessageInput, Reply } from "./types";

const nameSchema = z
  .string({ required_error: "Не указано имя" })
  .min(2, "Слишком короткое имя, минимум 2 символа")
  .max(20, "Слишком длинное имя, максимум 20 символов")
  .regex(/^[\wа-яё]+$/iu, "Имя может содержать только кириллицу, латиницу, цифры и _");

export function setName(repo: CheeseRepository, random: Random, text: string, chatId: number, fromId: number): Reply {
  const displayName = commandArgs(text);
  const parsed = nameSchema.safeParse(displayName || undefined);
  if (!parsed.success) return { text: parsed.error.issues[0]!.message };
  const { alreadyExists } = repo.setDisplayName(fromId, chatId, parsed.data);
  return {
    text: alreadyExists
      ? fill("Пользователь с именем %displayName% уже есть", { displayName: escapeHtml(parsed.data) })
      : replica(random, userReplicas.changed, { displayName: escapeHtml(parsed.data) }),
  };
}

export function about(repo: CheeseRepository, random: Random, input: MessageInput): Reply {
  const text = input.text ?? "";
  const arg = commandArgs(text);
  const textMention = input.entities?.find((entity) => entity.type === "text_mention" && entity.user?.id);
  const mention = input.entities?.find((entity) => entity.type === "mention" && entity.offset > 0);
  const mentionText = mention ? text.slice(mention.offset, mention.offset + mention.length) : undefined;
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
  return { text: renderAbout(random, user) };
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
