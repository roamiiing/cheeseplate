import { CheeseRepository } from "../repository";

export type LegacyUser = {
  id: number;
  telegramId: string | number;
  displayName: string;
  telegramUsername: string | null;
  chatTelegramId: string | number;
};

export type LegacyTag = {
  id: number;
  tag: string;
  chatTelegramId: string | number;
};

export type LegacyRelation = { A: number; B: number };

export function importLegacyRows(repo: CheeseRepository, legacyUsers: LegacyUser[], legacyTags: LegacyTag[], legacyRelations: LegacyRelation[]) {
  const userByLegacyId = new Map<number, LegacyUser>();
  const tagByLegacyId = new Map<number, LegacyTag>();

  for (const user of legacyUsers) {
    userByLegacyId.set(user.id, user);
    repo.upsertUser({
      telegramId: Number(user.telegramId),
      chatId: Number(user.chatTelegramId),
      firstName: user.displayName,
      username: user.telegramUsername ?? undefined,
    });
    repo.setDisplayName(Number(user.telegramId), Number(user.chatTelegramId), user.displayName);
  }

  for (const tag of legacyTags) tagByLegacyId.set(tag.id, tag);

  for (const relation of legacyRelations) {
    const tag = tagByLegacyId.get(relation.A);
    const user = userByLegacyId.get(relation.B);
    if (!tag || !user) continue;
    repo.setTagForUser(Number(user.telegramId), Number(user.chatTelegramId), tag.tag.toLowerCase());
  }
}
