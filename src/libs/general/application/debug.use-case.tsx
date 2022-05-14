import * as React from 'react'
import { UseCase } from '@/libs/shared/workflow'
import { getMarkupWith } from '@/libs/shared/react'
import { Debug, DebugProps } from './components'
import { Information, Time } from '@/libs/shared/math'

export const DEBUG_COMMAND = '/__debug'

type DebugInput = {
  chatInfo: DebugProps['chatInfo']
  serverInfo: {
    ram: {
      process: Information
      total: Information
    }
    uptime: Time
  }
}

export const debugUseCase =
  (): UseCase<DebugInput> =>
  async ({ input: { chatInfo, serverInfo } }) => {
    const { ram, uptime } = serverInfo

    const mappedServerInfo = {
      ram: `${ram.process.toString('MB')}/${ram.total.toString('MB')}`,
      uptime: uptime.toString('h'),
    }

    return {
      message: getMarkupWith(
        <Debug chatInfo={chatInfo} serverInfo={mappedServerInfo} />,
      ),
    }
  }
