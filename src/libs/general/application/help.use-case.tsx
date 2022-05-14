import * as React from 'react'
import { UseCase } from '@/libs/shared/workflow'
import { getMarkupWith } from '@/libs/shared/react'
import { Help } from './components'

import commands from '../../../../data/commands.json'

export const HELP_COMMAND = '/help'

export type HelpInput = void

export const helpUseCase = (): UseCase<HelpInput> => async () => {
  return { message: getMarkupWith(<Help commands={commands} />) }
}
