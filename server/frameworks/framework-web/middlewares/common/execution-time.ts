import dayjs from 'dayjs'
import { Middleware } from '@artus/pipeline'
import { ARTUS_WEB_APP } from '../../../../types'
import { ArtusApplication } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE } from '../../types'

export const executionTimeMiddleware: Middleware = async function executionTimeMiddleware (ctx, next) {
  const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE)

  const startTime = dayjs().valueOf()
  storage.set(startTime + 'ms', 'startTime')

  await next()

  const endTime = dayjs().valueOf()
  const elapsedTime = endTime - startTime
  storage.set(endTime + 'ms', 'endTime')
  storage.set(elapsedTime + 'ms', 'elapsedTime')

  // Show time.
  ;(ctx.namespace(ARTUS_WEB_APP).get('app') as ArtusApplication)
    .logger
    .info(
      'Pipeline elapsed',
      storage.get('elapsedTime')
    )
}
