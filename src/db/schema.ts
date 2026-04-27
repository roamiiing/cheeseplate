import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    telegramId: integer("telegram_id", { mode: "number" }).notNull(),
    chatId: integer("chat_id", { mode: "number" }).notNull(),
    displayName: text("display_name").notNull(),
    telegramUsername: text("telegram_username"),
  },
  (table) => ({
    telegramChatUnique: uniqueIndex("users_telegram_chat_unique").on(table.telegramId, table.chatId),
    displayChatUnique: uniqueIndex("users_display_chat_unique").on(table.displayName, table.chatId),
    usernameChatUnique: uniqueIndex("users_username_chat_unique").on(table.telegramUsername, table.chatId),
    chatIdx: index("users_chat_idx").on(table.chatId),
  }),
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tag: text("tag").notNull(),
    chatId: integer("chat_id", { mode: "number" }).notNull(),
  },
  (table) => ({
    tagChatUnique: uniqueIndex("tags_tag_chat_unique").on(table.tag, table.chatId),
    chatIdx: index("tags_chat_idx").on(table.chatId),
  }),
);

export const userTags = sqliteTable(
  "user_tags",
  {
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pairUnique: uniqueIndex("user_tags_pair_unique").on(table.userId, table.tagId),
    userIdx: index("user_tags_user_idx").on(table.userId),
    tagIdx: index("user_tags_tag_idx").on(table.tagId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  userTags: many(userTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  userTags: many(userTags),
}));

export const userTagsRelations = relations(userTags, ({ one }) => ({
  user: one(users, { fields: [userTags.userId], references: [users.id] }),
  tag: one(tags, { fields: [userTags.tagId], references: [tags.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Tag = typeof tags.$inferSelect;
