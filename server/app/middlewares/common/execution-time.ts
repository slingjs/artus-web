import dayjs from 'dayjs'
import { ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE } from '../../types'
import { judgeCtxIsFromHTTP } from '../../utils/middlewares'
import { HTTPMiddleware } from '../../plugins/plugin-http/types'
import { WebsocketMiddleware } from '../../plugins/plugin-websocket/types'
import { Middleware } from '@artus/pipeline'

export const executionTimeMiddleware = function executionTimeMiddleware<T extends Middleware = HTTPMiddleware>() {
  return <any | (T extends HTTPMiddleware ? HTTPMiddleware : WebsocketMiddleware)>(
    async function executionTimeMiddleware(ctx, next) {
      const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_EXECUTION_NAMESPACE)

      const startTime = dayjs().valueOf()
      storage.set(startTime + 'ms', 'startTime')

      await next()

      const endTime = dayjs().valueOf()
      const elapsedTime = endTime - startTime
      storage.set(endTime + 'ms', 'endTime')
      storage.set(elapsedTime + 'ms', 'elapsedTime')

      // Show time.
      const {
        input: {
          params: { app, req }
        }
      } = ctx
      if (judgeCtxIsFromHTTP(ctx)) {
        app.logger.info('Pipeline elapsed %s, method: %s, path: %s', storage.get('elapsedTime'), req.method, req.url)

        return
      }

      // Show time.
      const {
        input: {
          params: { eventName }
        }
      } = ctx
      app.logger.info('Pipeline elapsed %s, event: %s, path: %s', storage.get('elapsedTime'), eventName, req.url)
    }
  )
}
