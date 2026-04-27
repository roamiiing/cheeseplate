import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>["db"];

export function sqlitePathFromUrl(url = process.env.DATABASE_URL ?? "file:./data/cheeseplate.sqlite") {
  if (url === ":memory:" || url === "file::memory:") return ":memory:";
  return url.startsWith("file:") ? url.slice("file:".length) : url;
}

export function createDb(url = process.env.DATABASE_URL ?? "file:./data/cheeseplate.sqlite") {
  const path = sqlitePathFromUrl(url);
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  sqlite.run("PRAGMA foreign_keys = ON");
  return { sqlite, db: drizzle(sqlite, { schema }) };
}
