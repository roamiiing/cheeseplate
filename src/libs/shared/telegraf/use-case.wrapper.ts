import { Context, TelegramError } from 'telegraf'
import { captureException } from '@sentry/node'

import { UseCase, UseCaseContext, UseCaseResult } from '@/libs/shared/workflow'
import { Queue, QueueError } from '@/libs/shared/queue'
import { time } from '@/libs/shared/math'

import { mapContext } from './context.mapper'

export const wrapUseCase = async <Input>(
  ctx: Context,
  useCase: UseCase<Input>,
  queue: Queue,
  input?: Input,
) => {
  const result = await useCase(mapContext(ctx)(input) as UseCaseContext<Input>)

  processResult(result, ctx, queue)
}

export const processResult = (
  result: UseCaseResult | undefined | null | never | void,
  ctx: Context,
  queue: Queue,
) => {
  queue.enqueue(
    ctx.message?.chat.id ?? Infinity,
    async () => {
      const { notify = false } = result?.options ?? {}

      try {
        if (result) {
          if ('media' in result) {
            const media = result.media

            // add more types if needed
            await ctx.replyWithMediaGroup(
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
            )
          } else if ('message' in result)
            await ctx.replyWithHTML(result.message, {
              reply_to_message_id: ctx.message!.message_id,
              disable_notification: !notify,
            })
          else if ('gif' in result)
            await ctx.replyWithAnimation(result.gif, {
              reply_to_message_id: ctx.message!.message_id,
              disable_notification: !notify,
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
