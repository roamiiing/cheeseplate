export type EventData = Record<string, unknown>

export type SendEvent = (event: string, data?: EventData) => void
