import { z } from "zod";
import type { User } from "../db/schema";
import type { Random } from "../random";
import type { CheeseRepository } from "../repository";
import { commandArgs, escapeHtml, extractHashTags } from "../text";
import { fill, replica, tagReplicas } from "./replicas";
import { emptyResult, replyResult, type HandlerResult, type MessageInput, type Reply } from "./types";

const tagSchema = z
  .string()
  .min(2, "Слишком короткий тег! Минимум 2 символа")
  .max(20, "Слишком длинный тег! Максимум 20 символов")
  .regex(/^[\wа-яё]+$/iu, "Неверный формат! Тег может содержать латинские буквы, кириллицу, цифры и _");

const reservedTags = new Set(["all", "hangman"]);

export function setTag(repo: CheeseRepository, random: Random, text: string, chatId: number, fromId: number): HandlerResult {
  const tag = commandArgs(text).toLowerCase();
  const event = (data: Record<string, unknown>) => ({ name: "tag_set_requested", data: { chatId, fromId, tag, tagLength: tag.length, ...data } });
  if (!tag) return replyResult({ text: "А тег указать? <pre>/settag тег</pre>" }, [event({ valid: false, rejectedReason: "missing", created: false, reserved: false })]);
  const parsed = tagSchema.safeParse(tag);
  if (!parsed.success) return replyResult({ text: parsed.error.issues[0]!.message }, [event({ valid: false, rejectedReason: parsed.error.issues[0]!.message, created: false, reserved: false })]);
  if (reservedTags.has(parsed.data)) return replyResult({ text: "Это зарезервированный тег" }, [event({ valid: false, rejectedReason: "reserved", created: false, reserved: true })]);
  const { newlyInserted } = repo.setTagForUser(fromId, chatId, parsed.data);
  return replyResult(
    { text: newlyInserted ? replica(random, tagReplicas.set, { tag: escapeHtml(parsed.data) }) : fill("У тебя уже есть тег %tag%", { tag: escapeHtml(parsed.data) }) },
    [event({ valid: true, rejectedReason: null, created: newlyInserted, reserved: false })],
  );
}

export function deleteTag(repo: CheeseRepository, random: Random, text: string, chatId: number, fromId: number): HandlerResult {
  const tag = commandArgs(text).toLowerCase();
  const event = (data: Record<string, unknown>) => ({ name: "tag_delete_requested", data: { chatId, fromId, tag, tagLength: tag.length, ...data } });
  if (!tag) return replyResult({ text: "А тег указать? <pre>/deltag</pre>" }, [event({ valid: false, rejectedReason: "missing", deleted: false, reserved: false })]);
  const parsed = tagSchema.safeParse(tag);
  if (!parsed.success) return replyResult({ text: parsed.error.issues[0]!.message }, [event({ valid: false, rejectedReason: parsed.error.issues[0]!.message, deleted: false, reserved: false })]);
  if (reservedTags.has(parsed.data)) return replyResult({ text: "Это зарезервированный тег" }, [event({ valid: false, rejectedReason: "reserved", deleted: false, reserved: true })]);
  const { deleted } = repo.deleteTagForUser(fromId, chatId, parsed.data);
  return replyResult(
    { text: deleted ? replica(random, tagReplicas.removed, { tag: escapeHtml(parsed.data) }) : fill("У тебя не было тега <b>%tag%</b>", { tag: escapeHtml(parsed.data) }) },
    [event({ valid: true, rejectedReason: null, deleted, reserved: false })],
  );
}

export function dryPing(repo: CheeseRepository, random: Random, text: string, chatId: number): HandlerResult {
  const tags = commandArgs(text).split(/\s+/).filter(Boolean).map((tag) => tag.toLowerCase());
  const result = pingTags(repo, random, tags, chatId, undefined, true);
  const reply = result.reply ?? { text: "Нет юзеров с такими тегами" };
  return replyResult(reply, [
    {
      name: "dryping_requested",
      data: {
        chatId,
        tags,
        uniqueTags: [...new Set(tags)],
        tagCount: tags.length,
        uniqueTagCount: new Set(tags).size,
        hasAllTag: tags.includes("all"),
        matchedUserCount: result.users.length,
        replied: true,
      },
    },
  ]);
}

export function pingFromMessage(repo: CheeseRepository, random: Random, input: MessageInput): HandlerResult {
  const textTags = extractHashTags(input.text ?? "");
  const captionTags = extractHashTags(input.caption ?? "");
  const tags = [...textTags, ...captionTags];
  if (tags.length === 0) return emptyResult();
  const result = pingTags(repo, random, tags, input.chatId, input.fromId, false);
  const uniqueHashtags = [...new Set(tags)];
  const matchedHashtags = uniqueHashtags.filter((tag) => result.matchedTags.includes(tag));
  const taggedUsers = result.users.map((user) => ({ telegramId: user.telegramId, displayName: user.displayName }));
  return {
    reply: result.reply,
    events: [
      {
        name: "message_hashtags_seen",
        data: {
          chatId: input.chatId,
          fromId: input.fromId,
          source: textTags.length > 0 && captionTags.length > 0 ? "text_and_caption" : textTags.length > 0 ? "text" : "caption",
          originalHashtagCount: tags.length,
          uniqueHashtagCount: uniqueHashtags.length,
          duplicateHashtagCount: tags.length - uniqueHashtags.length,
          hashtags: tags,
          uniqueHashtags,
          matchedHashtags,
          unmatchedHashtags: uniqueHashtags.filter((tag) => !matchedHashtags.includes(tag)),
          hasAllTag: tags.includes("all"),
          authorExcluded: result.authorExcluded,
          matchedUserCount: result.matchedUsers.length,
          taggedUserCount: taggedUsers.length,
          taggedUsers,
          replied: result.reply !== undefined,
          notify: result.reply?.notify ?? false,
        },
      },
    ],
  };
}

function pingTags(repo: CheeseRepository, random: Random, tags: string[], chatId: number, excludeTelegramId: number | undefined, dry: boolean): PingTagsResult {
  if (tags.length === 0) return { users: [], matchedUsers: [], matchedTags: [], authorExcluded: false };
  const uniqueTags = [...new Set(tags)];
  const hasAllTag = uniqueTags.includes("all");
  const matchedUsers = hasAllTag ? repo.getAllUsersInChat(chatId) : repo.getUsersWithTags(uniqueTags, chatId);
  const users = excludeTelegramId === undefined ? matchedUsers : matchedUsers.filter((user) => user.telegramId !== excludeTelegramId);
  const authorExcluded = excludeTelegramId !== undefined && matchedUsers.some((user) => user.telegramId === excludeTelegramId);
  const matchedTags = hasAllTag ? ["all"] : repo.getUsedTags(chatId).map((row) => row.tag).filter((tag) => uniqueTags.includes(tag));
  if (users.length === 0) return { users, matchedUsers, matchedTags, authorExcluded, reply: dry ? { text: "Нет юзеров с такими тегами" } : undefined };
  if (dry) return { users, matchedUsers, matchedTags, authorExcluded, reply: { text: replica(random, tagReplicas.dryping, { data: escapeHtml(users.map((user) => user.displayName).join(", ")) }) } };
  const links = users.map((user) => `<a href="tg://user?id=${user.telegramId}">${escapeHtml(user.displayName)}</a>`).join(", ");
  return { users, matchedUsers, matchedTags, authorExcluded, reply: { text: replica(random, tagReplicas.ping, { data: links }), notify: true } };
}

type PingTagsResult = {
  users: User[];
  matchedUsers: User[];
  matchedTags: string[];
  authorExcluded: boolean;
  reply?: Reply;
};

export function tagList(repo: CheeseRepository, chatId: number): HandlerResult {
  const rows = repo.getUsedTags(chatId);
  return replyResult(
    { text: rows.length ? rows.map((row) => `#${escapeHtml(row.tag)} (${row.count})`).join("\n") : "Тегов пока нет" },
    [{ name: "taglist_requested", data: { chatId, tagCount: rows.length, totalAssignments: rows.reduce((sum, row) => sum + Number(row.count), 0) } }],
  );
}
