import { z } from "zod";
import type { Random } from "../random";
import type { CheeseRepository } from "../repository";
import { commandArgs, escapeHtml, extractHashTags } from "../text";
import { fill, replica, tagReplicas } from "./replicas";
import type { MessageInput, Reply } from "./types";

const tagSchema = z
  .string()
  .min(2, "Слишком короткий тег! Минимум 2 символа")
  .max(20, "Слишком длинный тег! Максимум 20 символов")
  .regex(/^[\wа-яё]+$/iu, "Неверный формат! Тег может содержать латинские буквы, кириллицу, цифры и _");

const reservedTags = new Set(["all", "hangman"]);

export function setTag(repo: CheeseRepository, random: Random, text: string, chatId: number, fromId: number): Reply {
  const tag = commandArgs(text).toLowerCase();
  if (!tag) return { text: "А тег указать? <pre>/settag тег</pre>" };
  const parsed = tagSchema.safeParse(tag);
  if (!parsed.success) return { text: parsed.error.issues[0]!.message };
  if (reservedTags.has(parsed.data)) return { text: "Это зарезервированный тег" };
  const { newlyInserted } = repo.setTagForUser(fromId, chatId, parsed.data);
  return { text: newlyInserted ? replica(random, tagReplicas.set, { tag: escapeHtml(parsed.data) }) : fill("У тебя уже есть тег %tag%", { tag: escapeHtml(parsed.data) }) };
}

export function deleteTag(repo: CheeseRepository, random: Random, text: string, chatId: number, fromId: number): Reply {
  const tag = commandArgs(text).toLowerCase();
  if (!tag) return { text: "А тег указать? <pre>/deltag</pre>" };
  const parsed = tagSchema.safeParse(tag);
  if (!parsed.success) return { text: parsed.error.issues[0]!.message };
  if (reservedTags.has(parsed.data)) return { text: "Это зарезервированный тег" };
  const { deleted } = repo.deleteTagForUser(fromId, chatId, parsed.data);
  return { text: deleted ? replica(random, tagReplicas.removed, { tag: escapeHtml(parsed.data) }) : fill("У тебя не было тега <b>%tag%</b>", { tag: escapeHtml(parsed.data) }) };
}

export function dryPing(repo: CheeseRepository, random: Random, text: string, chatId: number): Reply {
  const tags = commandArgs(text).split(/\s+/).filter(Boolean).map((tag) => tag.toLowerCase());
  return pingTags(repo, random, tags, chatId, undefined, true) ?? { text: "Нет юзеров с такими тегами" };
}

export function pingFromMessage(repo: CheeseRepository, random: Random, input: MessageInput): Reply | undefined {
  const tags = extractHashTags(`${input.text ?? ""}\n${input.caption ?? ""}`);
  return pingTags(repo, random, tags, input.chatId, input.fromId, false);
}

function pingTags(repo: CheeseRepository, random: Random, tags: string[], chatId: number, excludeTelegramId: number | undefined, dry: boolean): Reply | undefined {
  if (tags.length === 0) return undefined;
  const users = tags.includes("all") ? repo.getAllUsersInChat(chatId, excludeTelegramId) : repo.getUsersWithTags(tags, chatId, excludeTelegramId);
  if (users.length === 0) return dry ? { text: "Нет юзеров с такими тегами" } : undefined;
  if (dry) return { text: replica(random, tagReplicas.dryping, { data: escapeHtml(users.map((user) => user.displayName).join(", ")) }) };
  const links = users.map((user) => `<a href="tg://user?id=${user.telegramId}">${escapeHtml(user.displayName)}</a>`).join(", ");
  return { text: replica(random, tagReplicas.ping, { data: links }), notify: true };
}

export function tagList(repo: CheeseRepository, chatId: number): Reply {
  const rows = repo.getUsedTags(chatId);
  return { text: rows.length ? rows.map((row) => `#${escapeHtml(row.tag)} (${row.count})`).join("\n") : "Тегов пока нет" };
}
