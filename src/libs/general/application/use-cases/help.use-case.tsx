import * as React from 'react'

import { getMarkupWith } from '@/libs/shared/react'
import { UseCase } from '@/libs/shared/workflow'

import commands from '../../../../../data/commands.json'
import { Help } from '../components'

export const HELP_COMMAND = '/help'

export type HelpInput = void

export const helpUseCase = (): UseCase<HelpInput> => async () => {
  return { message: getMarkupWith(<Help commands={commands} />) }
}
