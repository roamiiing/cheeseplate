import { Context } from 'telegraf'

import { Queue } from '@/libs/shared/queue'
import { UseCaseContext } from '@/libs/shared/workflow'
import { GeneratorUseCase } from '@/libs/shared/workflow'

import { AnalyticsContext, sendCommandAnalytics } from './analytics'
import { mapContext } from './context.mapper'
import { processResult } from './use-case.wrapper'

export const wrapGeneratorUseCase = async <Input>(
  ctx: Context,
  useCase: GeneratorUseCase<Input>,
  queue: Queue,
  input?: Input,
  analyticsCtx?: AnalyticsContext,
) => {
  let success = true

  for await (const result of useCase(
    mapContext(ctx)(input) as UseCaseContext<Input>,
  )) {
    if (result?.options?.success === false) {
      success = false
    }

    await processResult(result, ctx, queue)
  }

  sendCommandAnalytics({
    ...analyticsCtx,
    data: {
      ...analyticsCtx?.data,
      chatId: ctx.chat?.id.toString() ?? '',
      success,
    },
  })
}
