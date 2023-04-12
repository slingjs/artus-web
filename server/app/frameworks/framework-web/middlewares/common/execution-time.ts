import dayjs from 'dayjs'
import { ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE } from '../../types'
import { HTTPMiddleware } from '../../../../plugins/plugin-http/types'

export const executionTimeMiddleware = function executionTimeMiddleware (): HTTPMiddleware {
  return async function executionTimeMiddleware (ctx, next) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE)

    const startTime = dayjs().valueOf()
    storage.set(startTime + 'ms', 'startTime')

    await next()

    const endTime = dayjs().valueOf()
    const elapsedTime = endTime - startTime
    storage.set(endTime + 'ms', 'endTime')
    storage.set(elapsedTime + 'ms', 'elapsedTime')

    // Show time.
    const { input: { params: { app } } } = ctx
    app.logger.info('Pipeline elapsed', storage.get('elapsedTime'))
  }
}
