import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb } from "../src/db/client";
import { migrate } from "../src/db/migrate";
import { createCheeseHandlers } from "../src/handlers";
import { CheeseRepository } from "../src/repository";
import { getProxyUrl, proxyMode } from "../src/proxy";
import { importLegacyRows } from "../src/scripts/legacy-importer";
import type { HandlerResult, Reply } from "../src/handlers";

let dir: string;
let repo: CheeseRepository;
let service: ReturnType<typeof createCheeseHandlers>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "cheeseplate-"));
  const url = `file:${join(dir, "test.sqlite")}`;
  migrate(url);
  repo = new CheeseRepository(createDb(url).db);
  service = createCheeseHandlers(repo, () => 0.42, Date.now());
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function user(telegramId: number, chatId = 100, displayName = `user${telegramId}`, username?: string) {
  repo.upsertUser({ telegramId, chatId, firstName: displayName, username });
  repo.setDisplayName(telegramId, chatId, displayName);
}

function replyOf(result: HandlerResult): Reply {
  expect(result.reply).toBeDefined();
  return result.reply!;
}

test("upserts users on message identity", () => {
  repo.upsertUser({ telegramId: 1, chatId: 100, firstName: "Alice", username: "alice" });
  repo.upsertUser({ telegramId: 1, chatId: 100, firstName: "Ignored", username: "alice2" });
  const saved = repo.getUser(1, 100)!;
  expect(saved.displayName).toBe("Alice");
  expect(saved.telegramUsername).toBe("alice2");
});

test("upsert moves a telegram username when it changed owners after legacy import", () => {
  repo.upsertUser({ telegramId: 1, chatId: 100, firstName: "Old", username: "shared" });
  repo.upsertUser({ telegramId: 2, chatId: 100, firstName: "New", username: "shared" });

  expect(repo.getUser(1, 100)!.telegramUsername).toBeNull();
  expect(repo.getUser(2, 100)!.telegramUsername).toBe("shared");
});

test("/settag validates, reserves names and ignores duplicates", () => {
  user(1);
  const created = service.setTag("/settag dev", 100, 1);
  expect(replyOf(created).text).toContain("dev");
  expect(created.events[0]).toMatchObject({ name: "tag_set_requested", data: { chatId: 100, fromId: 1, tag: "dev", tagLength: 3, valid: true, created: true, reserved: false } });
  const duplicate = service.setTag("/settag dev", 100, 1);
  expect(replyOf(duplicate).text).toContain("уже есть");
  expect(duplicate.events[0]!.data).toMatchObject({ valid: true, created: false });
  const invalid = service.setTag("/settag !", 100, 1);
  expect(replyOf(invalid).text).toContain("Слишком короткий");
  expect(invalid.events[0]!.data).toMatchObject({ valid: false, created: false });
  const reserved = service.setTag("/settag all", 100, 1);
  expect(replyOf(reserved).text).toContain("зарезервированный");
  expect(reserved.events[0]!.data).toMatchObject({ valid: false, rejectedReason: "reserved", reserved: true });
});

test("/deltag deletes existing user tag and reports missing tag", () => {
  user(1);
  service.setTag("/settag dev", 100, 1);
  const deleted = service.deleteTag("/deltag dev", 100, 1);
  expect(replyOf(deleted).text).toContain("dev");
  expect(deleted.events[0]).toMatchObject({ name: "tag_delete_requested", data: { tag: "dev", valid: true, deleted: true } });
  const missing = service.deleteTag("/deltag dev", 100, 1);
  expect(replyOf(missing).text).toContain("не было");
  expect(missing.events[0]!.data).toMatchObject({ valid: true, deleted: false });
});

test("#tag pings text and caption users without pinging author; empty result is silent", () => {
  user(1, 100, "Alice");
  user(2, 100, "Bob");
  service.setTag("/settag dev", 100, 1);
  service.setTag("/settag dev", 100, 2);
  const textPing = service.pingFromMessage({ text: "hi #dev #dev #none", chatId: 100, fromId: 1 });
  expect(replyOf(textPing).text).toContain("Bob");
  expect(textPing.events[0]).toMatchObject({
    name: "message_hashtags_seen",
    data: {
      source: "text",
      originalHashtagCount: 3,
      uniqueHashtagCount: 2,
      duplicateHashtagCount: 1,
      hashtags: ["dev", "dev", "none"],
      uniqueHashtags: ["dev", "none"],
      matchedHashtags: ["dev"],
      unmatchedHashtags: ["none"],
      authorExcluded: true,
      matchedUserCount: 2,
      taggedUserCount: 1,
      taggedUsers: [{ telegramId: 2, displayName: "Bob" }],
      replied: true,
      notify: true,
    },
  });
  const captionPing = service.pingFromMessage({ caption: "cap #dev", chatId: 100, fromId: 2 });
  expect(replyOf(captionPing).text).toContain("Alice");
  expect(captionPing.events[0]!.data).toMatchObject({ source: "caption" });
  const mixedPing = service.pingFromMessage({ text: "hi #dev", caption: "cap #none", chatId: 100, fromId: 1 });
  expect(mixedPing.events[0]!.data).toMatchObject({ source: "text_and_caption", hashtags: ["dev", "none"] });
  const silent = service.pingFromMessage({ text: "hi #none", chatId: 100, fromId: 1 });
  expect(silent.reply).toBeUndefined();
  expect(silent.events[0]!.data).toMatchObject({ replied: false, taggedUserCount: 0, notify: false });
  expect(service.pingFromMessage({ text: "hi", chatId: 100, fromId: 1 }).events).toEqual([]);
});

test("/dryping all and tags list expected users", () => {
  user(1, 100, "Alice");
  user(2, 100, "Bob");
  service.setTag("/settag dev", 100, 2);
  const all = service.dryPing("/dryping all", 100);
  expect(replyOf(all).text).toContain("Alice");
  expect(all.events[0]).toMatchObject({ name: "dryping_requested", data: { tags: ["all"], uniqueTags: ["all"], hasAllTag: true, matchedUserCount: 2, replied: true } });
  const dev = service.dryPing("/dryping dev", 100);
  expect(replyOf(dev).text).toContain("Bob");
  expect(dev.events[0]!.data).toMatchObject({ tags: ["dev"], matchedUserCount: 1 });
});

test("/taglist hides unused tags", () => {
  user(1);
  service.setTag("/settag dev", 100, 1);
  service.deleteTag("/deltag dev", 100, 1);
  const result = service.tagList(100);
  expect(replyOf(result).text).not.toContain("#dev");
  expect(result.events[0]).toMatchObject({ name: "taglist_requested", data: { chatId: 100, tagCount: 0, totalAssignments: 0 } });
});

test("/setname validates and catches unique conflicts", () => {
  user(1, 100, "Alice");
  user(2, 100, "Bob");
  expect(replyOf(service.setName("/setname Bo!", 100, 1)).text).toContain("только");
  const exists = service.setName("/setname Bob", 100, 1);
  expect(replyOf(exists).text).toContain("уже есть");
  expect(exists.events[0]).toMatchObject({ name: "display_name_set_requested", data: { displayName: "Bob", nameLength: 3, valid: true, alreadyExists: true, changed: false } });
  const changed = service.setName("/setname Carol", 100, 1);
  expect(replyOf(changed).text).toContain("Carol");
  expect(changed.events[0]!.data).toMatchObject({ displayName: "Carol", changed: true });
});

test("/about supports self, display name, username, reply and text mention", () => {
  user(1, 100, "Alice", "alice");
  user(2, 100, "Bob", "bob");
  service.setTag("/settag dev", 100, 2);
  const self = service.about({ text: "/about", chatId: 100, fromId: 1 });
  expect(replyOf(self).text).toContain("Alice");
  expect(self.events[0]).toMatchObject({ name: "user_about_requested", data: { lookupMethod: "self", lookupValue: 1, found: true, targetTelegramId: 1, targetDisplayName: "Alice", targetTagCount: 0 } });
  const display = service.about({ text: "/about Bob", chatId: 100, fromId: 1 });
  expect(replyOf(display).text).toContain("#dev");
  expect(display.events[0]!.data).toMatchObject({ lookupMethod: "display_name", lookupValue: "Bob", targetTelegramId: 2, targetTagCount: 1 });
  const username = service.about({ text: "/about @bob", chatId: 100, fromId: 1, entities: [{ type: "bot_command", offset: 0, length: 6 }, { type: "mention", offset: 7, length: 4 }] });
  expect(replyOf(username).text).toContain("Bob");
  expect(username.events[0]!.data).toMatchObject({ lookupMethod: "username", lookupValue: "@bob" });
  expect(replyOf(service.about({ text: "/about", chatId: 100, fromId: 1, replyToUserId: 2 })).text).toContain("Bob");
  expect(replyOf(service.about({ text: "/about Bob", chatId: 100, fromId: 1, entities: [{ type: "bot_command", offset: 0, length: 6 }, { type: "text_mention", offset: 7, length: 3, user: { id: 2 } }] })).text).toContain("Bob");
  expect(service.about({ text: "/about Nobody", chatId: 100, fromId: 1 }).events[0]!.data).toMatchObject({ lookupMethod: "display_name", lookupValue: "Nobody", found: false });
});

test("/roll, /pick and /ben use injected random", () => {
  const roll = service.roll("/roll deploy", 100, 1);
  expect(replyOf(roll).text).toContain("42%");
  expect(roll.events[0]).toMatchObject({ name: "roll_requested", data: { fromId: 1, chatId: 100, question: "deploy", hasQuestion: true, questionLength: 6, probability: 42 } });
  const picked = service.pick("/pick one, two", 100, 1);
  expect(replyOf(picked).text).toContain("one");
  expect(picked.events[0]).toMatchObject({ name: "pick_requested", data: { choices: ["one", "two"], choiceCount: 2, selectedChoice: "one", selectedIndex: 0 } });
  const invalidPick = service.pick("/pick one", 100, 1);
  expect(invalidPick.events[0]!.data).toMatchObject({ valid: false, choices: ["one"], choiceCount: 1, selectedChoice: null, selectedIndex: null });
  const gif = service.ben(100, 1);
  expect(replyOf(gif).gif).toContain("yes-ben");
  expect(gif.events[0]).toMatchObject({ name: "ben_requested", data: { gifIndex: 0 } });
});

test("/help excludes neuro commands and /__debug logs technical fields", () => {
  const result = service.help(100, 1);
  const text = replyOf(result).text!;
  expect(text).toContain("/settag");
  expect(text).not.toContain("/dalle");
  expect(text).not.toContain("/rugpt");
  expect(result.events[0]).toMatchObject({ name: "help_requested", data: { commandCount: 10 } });
  const debug = service.debug(100, 1, "group", "/tmp/test.sqlite", "disabled");
  expect(replyOf(debug).text).toContain("sqlite");
  expect(debug.events[0]).toMatchObject({ name: "debug_requested", data: { fromId: 1, chatId: 100, chatType: "group", proxyMode: "disabled", sqlitePath: "/tmp/test.sqlite" } });
});

test("proxy helper chooses Telegram proxy env and ignores global proxy env", () => {
  expect(getProxyUrl({ TG_HTTPS_PROXY: "http://secure:3128", TG_HTTP_PROXY: "http://plain:3128" })).toBe("http://secure:3128");
  expect(getProxyUrl({ TG_HTTP_PROXY: "http://plain:3128" })).toBe("http://plain:3128");
  expect(getProxyUrl({ tg_https_proxy: "http://lower:3128" })).toBe("http://lower:3128");
  expect(getProxyUrl({ TG_HTTPS_PROXY: "http://secure:3128", TG_NO_PROXY: "api.telegram.org" })).toBeUndefined();
  expect(getProxyUrl({ HTTPS_PROXY: "http://global:3128", HTTP_PROXY: "http://global:3128" })).toBeUndefined();
  expect(proxyMode({ TG_HTTPS_PROXY: "http://user:pass@secure:3128" })).toBe("http://secure:3128");
});

test("legacy import is idempotent", () => {
  importLegacyRows(
    repo,
    [{ id: 10, telegramId: "1", displayName: "Alice", telegramUsername: "alice", chatTelegramId: "100" }],
    [{ id: 20, tag: "Dev", chatTelegramId: "100" }],
    [{ A: 20, B: 10 }],
  );
  importLegacyRows(
    repo,
    [{ id: 10, telegramId: "1", displayName: "Alice", telegramUsername: "alice", chatTelegramId: "100" }],
    [{ id: 20, tag: "Dev", chatTelegramId: "100" }],
    [{ A: 20, B: 10 }],
  );
  expect(replyOf(service.dryPing("/dryping dev", 100)).text).toContain("Alice");
  expect(repo.getUsedTags(100)[0]!.count).toBe(1);
});
