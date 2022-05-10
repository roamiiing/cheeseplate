export enum EntityType {
  Mention = 'Mention',
  TextMention = 'TextMention',
  Unsupported = 'Unsupported',
}

// TODO: If needed, add more (or all) of them
export type Entity =
  | {
      type: EntityType.Mention
      username: string
    }
  | {
      type: EntityType.TextMention
      userId: bigint
    }
  | {
      type: EntityType.Unsupported
    }

export type UserInfo = {
  userId: bigint
  displayName: string
}

export type UseCaseContext<Input> = {
  userInfo: UserInfo
  chatInfo: {
    chatId: bigint
  }
  messageInfo: {
    entities: Entity[]
    repliedMessageInfo?: {
      userInfo: UserInfo
    }
  }
  input: Input
}
