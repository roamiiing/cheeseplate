import { sendEvent } from '../analytics-client'

export type AnalyticsContext = {
  handleAnalytics?: boolean
  command?: string
  data?: {
    chatId: string
    success: boolean
  }
}

export const sendCommandAnalytics = ({
  handleAnalytics,
  command,
  data,
}: AnalyticsContext) => {
  if (handleAnalytics) {
    sendEvent(`command_${command?.replace('/', '')}`, data)
  }
}
