import { captureException } from '@sentry/node'
import { Context, TelegramError } from 'telegraf'
import { Message } from 'typegram'

import { time } from '@/libs/shared/math'
import { Queue, QueueError } from '@/libs/shared/queue'
import { UseCase, UseCaseContext, UseCaseResult } from '@/libs/shared/workflow'

import { AnalyticsContext, sendCommandAnalytics } from './analytics'
import { mapContext } from './context.mapper'

export const wrapUseCase = async <Input>(
  ctx: Context,
  useCase: UseCase<Input>,
  queue: Queue,
  input?: Input,
  analyticsCtx?: AnalyticsContext,
) => {
  const result = await useCase(mapContext(ctx)(input) as UseCaseContext<Input>)

  processResult(result, ctx, queue)
  sendCommandAnalytics({
    ...analyticsCtx,
    data: {
      ...analyticsCtx?.data,
      chatId: ctx.chat?.id.toString() ?? '',
      success: result?.options?.success ?? true,
    },
  })
}

export const processResult = (
  result: UseCaseResult | undefined | null | never | void,
  ctx: Context,
  queue: Queue,
) => {
  queue.enqueue(
    ctx.message?.chat.id ?? Infinity,
    async () => {
      const { notify = false, cleanupMessages = true } = result?.options ?? {}

      const sentMessages: Message[] = []

      try {
        if (result) {
          if ('media' in result) {
            const media = result.media

            // add more types if needed
            sentMessages.push(
              ...(await ctx.replyWithMediaGroup(
                media.map(image => ({
                  type: 'photo',
                  media: {
                    source: image.imageData,
                  },
                })),
                {
                  reply_to_message_id: ctx.message?.message_id,
                  allow_sending_without_reply: true,
                  disable_notification: !notify,
                },
              )),
            )
          } else if ('message' in result)
            sentMessages.push(
              await ctx.replyWithHTML(result.message, {
                reply_to_message_id: ctx.message?.message_id,
                disable_notification: !notify,
              }),
            )
          else if ('gif' in result)
            sentMessages.push(
              await ctx.replyWithAnimation(result.gif, {
                reply_to_message_id: ctx.message?.message_id,
                disable_notification: !notify,
              }),
            )
        }

        if (cleanupMessages) {
          sentMessages.forEach(message => {
            setTimeout(() => {
              queue.enqueue(message.chat.id, async () => {
                ctx.deleteMessage(message.message_id)
                ctx.deleteMessage(ctx.message?.message_id)
              })
            }, time(1, 'm').in('ms'))
          })
        }
      } catch (e) {
        const retryAfter = (e as TelegramError)?.response?.parameters
          ?.retry_after
        if (retryAfter) {
          console.log('Hit limit, retrying in', retryAfter)
          throw new QueueError(time(retryAfter, 's'))
        } else {
          console.log('Error in processResult', e)
          captureException(e)
        }
      }
    },
    result && 'media' in result ? result.media.length + 1 : 1,
  )
}
