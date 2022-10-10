import { Context } from 'telegraf'

import { Queue } from '@/libs/shared/queue'
import { UseCaseContext } from '@/libs/shared/workflow'
import { GeneratorUseCase } from '@/libs/shared/workflow'

import { mapContext } from './context.mapper'
import { processResult } from './use-case.wrapper'

export const wrapGeneratorUseCase = async <Input>(
  ctx: Context,
  useCase: GeneratorUseCase<Input>,
  queue: Queue,
  input?: Input,
) => {
  for await (const result of useCase(
    mapContext(ctx)(input) as UseCaseContext<Input>,
  )) {
    await processResult(result, ctx, queue)
  }
}
