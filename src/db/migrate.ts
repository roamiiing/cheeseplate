import { createDb, sqlitePathFromUrl } from "./client";

export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  telegram_id integer NOT NULL,
  chat_id integer NOT NULL,
  display_name text NOT NULL,
  telegram_username text
);
CREATE UNIQUE INDEX IF NOT EXISTS users_telegram_chat_unique ON users (telegram_id, chat_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_display_chat_unique ON users (display_name, chat_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_chat_unique ON users (telegram_username, chat_id);
CREATE INDEX IF NOT EXISTS users_chat_idx ON users (chat_id);

CREATE TABLE IF NOT EXISTS tags (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  tag text NOT NULL,
  chat_id integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS tags_tag_chat_unique ON tags (tag, chat_id);
CREATE INDEX IF NOT EXISTS tags_chat_idx ON tags (chat_id);

CREATE TABLE IF NOT EXISTS user_tags (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id integer NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS user_tags_pair_unique ON user_tags (user_id, tag_id);
CREATE INDEX IF NOT EXISTS user_tags_user_idx ON user_tags (user_id);
CREATE INDEX IF NOT EXISTS user_tags_tag_idx ON user_tags (tag_id);
`;

export function migrate(url = process.env.DATABASE_URL ?? "file:./data/cheeseplate.sqlite") {
  const { sqlite } = createDb(url);
  sqlite.exec(MIGRATION_SQL);
  sqlite.close();
}

if (import.meta.main) {
  migrate();
  console.log(`SQLite migrations applied to ${sqlitePathFromUrl()}`);
}
