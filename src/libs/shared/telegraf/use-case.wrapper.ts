import { Context } from 'telegraf'
import {
  Media,
  UseCase,
  UseCaseContext,
  UseCaseResult,
} from '@/libs/shared/workflow'
import { mapContext } from './context.mapper'

export const wrapUseCase = async <Input>(
  ctx: Context,
  useCase: UseCase<Input>,
  input?: Input,
) => {
  const result = await useCase(mapContext(ctx)(input) as UseCaseContext<Input>)

  await processResult(result, ctx)
}

export const processResult = async (
  result: UseCaseResult | undefined | null | never | void,
  ctx: Context,
) => {
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
        },
      )
    } else if ('message' in result)
      await ctx.replyWithHTML(result.message, {
        reply_to_message_id: ctx.message!.message_id,
      })
    else if ('gif' in result)
      await ctx.replyWithAnimation(result.gif, {
        reply_to_message_id: ctx.message!.message_id,
      })
  }
}
