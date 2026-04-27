import { and, eq, inArray, ne, sql } from "drizzle-orm";
import type { Db } from "./db/client";
import { tags, users, userTags, type NewUser, type User } from "./db/schema";

export type TelegramUserInput = {
  telegramId: number;
  chatId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
};

export type UserWithTags = User & { tagList: string[] };

export class CheeseRepository {
  constructor(private readonly db: Db) {}

  upsertUser(input: TelegramUserInput) {
    const existing = this.getUser(input.telegramId, input.chatId);
    const telegramUsername = this.claimTelegramUsername(input.telegramId, input.chatId, input.username ?? null);
    const fallbackName = [input.firstName, input.lastName].filter(Boolean).join("_") || input.username || String(input.telegramId);
    const desired: NewUser = {
      telegramId: input.telegramId,
      chatId: input.chatId,
      displayName: existing?.displayName ?? fallbackName.slice(0, 20),
      telegramUsername,
    };

    if (!existing) {
      return this.insertUserWithUniqueDisplayName(desired);
    }

    this.db
      .update(users)
      .set({ telegramUsername: desired.telegramUsername })
      .where(and(eq(users.telegramId, input.telegramId), eq(users.chatId, input.chatId)))
      .run();
    return this.getUser(input.telegramId, input.chatId)!;
  }

  private claimTelegramUsername(telegramId: number, chatId: number, username: string | null) {
    if (!username) return null;
    const existing = this.getUserByUsername(username, chatId);
    if (!existing || existing.telegramId === telegramId) return username;

    this.db
      .update(users)
      .set({ telegramUsername: null })
      .where(and(eq(users.telegramId, existing.telegramId), eq(users.chatId, chatId)))
      .run();

    return username;
  }

  private insertUserWithUniqueDisplayName(user: NewUser) {
    let name = user.displayName;
    for (let i = 0; i < 100; i += 1) {
      try {
        this.db.insert(users).values({ ...user, displayName: name }).run();
        return this.getUser(user.telegramId, user.chatId)!;
      } catch (error) {
        if (!isUniqueError(error)) throw error;
        name = `${user.displayName}_${i + 1}`.slice(0, 20);
      }
    }
    throw new Error("Could not allocate unique display name");
  }

  getUser(telegramId: number, chatId: number) {
    return this.db.select().from(users).where(and(eq(users.telegramId, telegramId), eq(users.chatId, chatId))).get();
  }

  getUserByDisplayName(displayName: string, chatId: number) {
    return this.db.select().from(users).where(and(eq(users.displayName, displayName), eq(users.chatId, chatId))).get();
  }

  getUserByUsername(username: string, chatId: number) {
    const clean = username.replace(/^@/, "");
    return this.db.select().from(users).where(and(eq(users.telegramUsername, clean), eq(users.chatId, chatId))).get();
  }

  getUserWithTags(user: User | undefined): UserWithTags | undefined {
    if (!user) return undefined;
    const rows = this.db
      .select({ tag: tags.tag })
      .from(userTags)
      .innerJoin(tags, eq(tags.id, userTags.tagId))
      .where(eq(userTags.userId, user.id))
      .orderBy(tags.tag)
      .all();
    return { ...user, tagList: rows.map((row) => row.tag) };
  }

  setDisplayName(telegramId: number, chatId: number, displayName: string) {
    const existing = this.getUserByDisplayName(displayName, chatId);
    if (existing && existing.telegramId !== telegramId) return { alreadyExists: true };
    this.db
      .update(users)
      .set({ displayName })
      .where(and(eq(users.telegramId, telegramId), eq(users.chatId, chatId)))
      .run();
    return { alreadyExists: false };
  }

  setTagForUser(telegramId: number, chatId: number, tag: string) {
    const user = this.getUser(telegramId, chatId);
    if (!user) throw new Error("User must be upserted before setting tags");
    this.db.insert(tags).values({ tag, chatId }).onConflictDoNothing().run();
    const tagRow = this.db.select().from(tags).where(and(eq(tags.tag, tag), eq(tags.chatId, chatId))).get();
    if (!tagRow) throw new Error("Tag insert failed");
    const existing = this.db.select().from(userTags).where(and(eq(userTags.userId, user.id), eq(userTags.tagId, tagRow.id))).get();
    if (existing) return { newlyInserted: false };
    this.db.insert(userTags).values({ userId: user.id, tagId: tagRow.id }).run();
    return { newlyInserted: true };
  }

  deleteTagForUser(telegramId: number, chatId: number, tag: string) {
    const user = this.getUser(telegramId, chatId);
    if (!user) return { deleted: false };
    const tagRow = this.db.select().from(tags).where(and(eq(tags.tag, tag), eq(tags.chatId, chatId))).get();
    if (!tagRow) return { deleted: false };
    const existing = this.db.select().from(userTags).where(and(eq(userTags.userId, user.id), eq(userTags.tagId, tagRow.id))).get();
    if (!existing) return { deleted: false };
    this.db.delete(userTags).where(and(eq(userTags.userId, user.id), eq(userTags.tagId, tagRow.id))).run();
    return { deleted: true };
  }

  getUsersWithTags(tagNames: string[], chatId: number, excludeTelegramId?: number) {
    if (tagNames.length === 0) return [];
    const where = [
      eq(tags.chatId, chatId),
      inArray(tags.tag, [...new Set(tagNames)]),
      excludeTelegramId === undefined ? undefined : ne(users.telegramId, excludeTelegramId),
    ].filter(Boolean);
    return this.db
      .selectDistinct({ id: users.id, telegramId: users.telegramId, chatId: users.chatId, displayName: users.displayName, telegramUsername: users.telegramUsername })
      .from(users)
      .innerJoin(userTags, eq(userTags.userId, users.id))
      .innerJoin(tags, eq(tags.id, userTags.tagId))
      .where(and(...where))
      .orderBy(users.displayName)
      .all();
  }

  getAllUsersInChat(chatId: number, excludeTelegramId?: number) {
    return this.db
      .select()
      .from(users)
      .where(and(eq(users.chatId, chatId), excludeTelegramId === undefined ? undefined : ne(users.telegramId, excludeTelegramId)))
      .orderBy(users.displayName)
      .all();
  }

  getUsedTags(chatId: number) {
    return this.db
      .select({ tag: tags.tag, count: sql<number>`count(${userTags.userId})` })
      .from(tags)
      .innerJoin(userTags, eq(userTags.tagId, tags.id))
      .where(eq(tags.chatId, chatId))
      .groupBy(tags.id)
      .orderBy(tags.tag)
      .all();
  }
}

function isUniqueError(error: unknown) {
  return error instanceof Error && error.message.includes("UNIQUE constraint failed");
}
