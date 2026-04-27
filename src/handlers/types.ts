export type Reply = { text?: string; gif?: string; notify?: boolean };

export type MessageInput = {
  text?: string;
  caption?: string;
  chatId: number;
  fromId: number;
  replyToUserId?: number;
  entities?: Array<{ type: string; offset: number; length: number; user?: { id: number } }>;
};
