import "dotenv/config";
import pg from "pg";
import { createDb } from "../db/client";
import { migrate } from "../db/migrate";
import { CheeseRepository } from "../repository";
import { importLegacyRows, type LegacyRelation, type LegacyTag, type LegacyUser } from "./legacy-importer";

const oldUrl = process.env.OLD_DATABASE_URL;
if (!oldUrl) throw new Error("OLD_DATABASE_URL is required");

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/cheeseplate.sqlite";
migrate(databaseUrl);
const { db } = createDb(databaseUrl);
const repo = new CheeseRepository(db);

const client = new pg.Client({ connectionString: oldUrl });
await client.connect();

try {
  const legacyUsers = (await client.query<LegacyUser>('select "id", "telegramId", "displayName", "telegramUsername", "chatTelegramId" from "User"')).rows;
  const legacyTags = (await client.query<LegacyTag>('select "id", "tag", "chatTelegramId" from "Tag"')).rows;
  const legacyRelations = (await client.query<LegacyRelation>('select "A", "B" from "_TagToUser"')).rows;

  importLegacyRows(repo, legacyUsers, legacyTags, legacyRelations);

  console.log(`Imported ${legacyUsers.length} users, ${legacyTags.length} tags, ${legacyRelations.length} tag relations`);
} finally {
  await client.end();
}
