import dayjs from 'dayjs'
import { ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE } from '../../types'
import { HTTPMiddleware } from '../../../../plugins/plugin-http/types'

export const httpExecutionTimeMiddleware = function httpExecutionTimeMiddleware (): HTTPMiddleware {
  return async function httpExecutionTimeMiddleware (ctx, next) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE)

    const startTime = dayjs().valueOf()
    storage.set(startTime + 'ms', 'startTime')

    await next()

    const endTime = dayjs().valueOf()
    const elapsedTime = endTime - startTime
    storage.set(endTime + 'ms', 'endTime')
    storage.set(elapsedTime + 'ms', 'elapsedTime')

    // Show time.
    const { input: { params: { app, req } } } = ctx
    app.logger.info(
      'Pipeline elapsed %s, method: %s, path: %s',
      storage.get('elapsedTime'),
      req.method,
      req.url
    )
  }
}
