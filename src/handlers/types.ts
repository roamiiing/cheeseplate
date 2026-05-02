export type Reply = { text?: string; gif?: string; notify?: boolean };

export type BusinessTelemetryEvent = {
  name: string;
  data: Record<string, unknown>;
};

export type HandlerResult = {
  reply?: Reply;
  events: BusinessTelemetryEvent[];
};

export function replyResult(reply: Reply, events: BusinessTelemetryEvent[] = []): HandlerResult {
  return { reply, events };
}

export function emptyResult(events: BusinessTelemetryEvent[] = []): HandlerResult {
  return { events };
}

export type MessageInput = {
  text?: string;
  caption?: string;
  chatId: number;
  fromId: number;
  replyToUserId?: number;
  entities?: Array<{ type: string; offset: number; length: number; user?: { id: number } }>;
};
