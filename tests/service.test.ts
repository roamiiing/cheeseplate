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
  expect(service.setTag("/settag dev", 100, 1).text).toContain("dev");
  expect(service.setTag("/settag dev", 100, 1).text).toContain("уже есть");
  expect(service.setTag("/settag !", 100, 1).text).toContain("Слишком короткий");
  expect(service.setTag("/settag all", 100, 1).text).toContain("зарезервированный");
});

test("/deltag deletes existing user tag and reports missing tag", () => {
  user(1);
  service.setTag("/settag dev", 100, 1);
  expect(service.deleteTag("/deltag dev", 100, 1).text).toContain("dev");
  expect(service.deleteTag("/deltag dev", 100, 1).text).toContain("не было");
});

test("#tag pings text and caption users without pinging author; empty result is silent", () => {
  user(1, 100, "Alice");
  user(2, 100, "Bob");
  service.setTag("/settag dev", 100, 1);
  service.setTag("/settag dev", 100, 2);
  expect(service.pingFromMessage({ text: "hi #dev", chatId: 100, fromId: 1 })!.text).toContain("Bob");
  expect(service.pingFromMessage({ caption: "cap #dev", chatId: 100, fromId: 2 })!.text).toContain("Alice");
  expect(service.pingFromMessage({ text: "hi #none", chatId: 100, fromId: 1 })).toBeUndefined();
});

test("/dryping all and tags list expected users", () => {
  user(1, 100, "Alice");
  user(2, 100, "Bob");
  service.setTag("/settag dev", 100, 2);
  expect(service.dryPing("/dryping all", 100).text).toContain("Alice");
  expect(service.dryPing("/dryping dev", 100).text).toContain("Bob");
});

test("/taglist hides unused tags", () => {
  user(1);
  service.setTag("/settag dev", 100, 1);
  service.deleteTag("/deltag dev", 100, 1);
  expect(service.tagList(100).text).not.toContain("#dev");
});

test("/setname validates and catches unique conflicts", () => {
  user(1, 100, "Alice");
  user(2, 100, "Bob");
  expect(service.setName("/setname Bo!", 100, 1).text).toContain("только");
  expect(service.setName("/setname Bob", 100, 1).text).toContain("уже есть");
  expect(service.setName("/setname Carol", 100, 1).text).toContain("Carol");
});

test("/about supports self, display name, username, reply and text mention", () => {
  user(1, 100, "Alice", "alice");
  user(2, 100, "Bob", "bob");
  service.setTag("/settag dev", 100, 2);
  expect(service.about({ text: "/about", chatId: 100, fromId: 1 }).text).toContain("Alice");
  expect(service.about({ text: "/about Bob", chatId: 100, fromId: 1 }).text).toContain("#dev");
  expect(service.about({ text: "/about @bob", chatId: 100, fromId: 1, entities: [{ type: "bot_command", offset: 0, length: 6 }, { type: "mention", offset: 7, length: 4 }] }).text).toContain("Bob");
  expect(service.about({ text: "/about", chatId: 100, fromId: 1, replyToUserId: 2 }).text).toContain("Bob");
  expect(service.about({ text: "/about Bob", chatId: 100, fromId: 1, entities: [{ type: "bot_command", offset: 0, length: 6 }, { type: "text_mention", offset: 7, length: 3, user: { id: 2 } }] }).text).toContain("Bob");
});

test("/roll, /pick and /ben use injected random", () => {
  expect(service.roll("/roll deploy").text).toContain("42%");
  expect(service.pick("/pick one, two").text).toContain("one");
  expect(service.ben().gif).toContain("yes-ben");
});

test("/help excludes neuro commands", () => {
  const text = service.help().text!;
  expect(text).toContain("/settag");
  expect(text).not.toContain("/dalle");
  expect(text).not.toContain("/rugpt");
});

test("proxy helper chooses HTTPS, falls back to HTTP, supports lowercase and NO_PROXY", () => {
  expect(getProxyUrl({ HTTPS_PROXY: "http://secure:3128", HTTP_PROXY: "http://plain:3128" })).toBe("http://secure:3128");
  expect(getProxyUrl({ HTTP_PROXY: "http://plain:3128" })).toBe("http://plain:3128");
  expect(getProxyUrl({ https_proxy: "http://lower:3128" })).toBe("http://lower:3128");
  expect(getProxyUrl({ HTTPS_PROXY: "http://secure:3128", NO_PROXY: "api.telegram.org" })).toBeUndefined();
  expect(proxyMode({ HTTPS_PROXY: "http://user:pass@secure:3128" })).toBe("http://secure:3128");
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
  expect(service.dryPing("/dryping dev", 100).text).toContain("Alice");
  expect(repo.getUsedTags(100)[0]!.count).toBe(1);
});
