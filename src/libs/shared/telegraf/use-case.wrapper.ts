import { Context } from 'telegraf'
import { UseCase, UseCaseContext } from '@/libs/shared/workflow'
import { mapContext } from './context.mapper'

export const wrapUseCase = async <Input>(
  ctx: Context,
  useCase: UseCase<Input>,
  input?: Input,
) => {
  const result = await useCase(mapContext(ctx)(input) as UseCaseContext<Input>)

  if (result) {
    await ctx.replyWithHTML(result.message, {
      reply_to_message_id: ctx.message!.message_id,
    })
  }
}
