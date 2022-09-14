export type UserToUpsert = {
  telegramId: bigint
  firstName: string
  telegramUsername?: string
  chatTelegramId: number
}

export type UpsertUserDeps = {
  upsertUser(user: UserToUpsert): Promise<void>
}

export const upsertUserMiddleware =
  ({ upsertUser }: UpsertUserDeps) =>
  async (user?: UserToUpsert) => {
    if (user) {
      await upsertUser(user)
    }
  }
