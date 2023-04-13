import { WebsocketController, WebsocketEvent, WebsocketUse } from '../../../../plugins/plugin-websocket/decorator'
import { WebSocketEventNames, WebsocketMiddleware } from '../../../../plugins/plugin-websocket/types'
import { websocketExecutionTimeMiddleware } from '../../middlewares/common/execution-time'

@WebsocketController('/ws/account')
@WebsocketUse([websocketExecutionTimeMiddleware()])
export default class AccountWsController {
  @WebsocketEvent(WebSocketEventNames.CONNECTION, { path: '/observe' })
  async handleConnection (...args: Parameters<WebsocketMiddleware>) {
    const [ctx, next] = args

    await ctx.input.params.trigger.response(ctx, 'Connected!')

    await next()
  }

  @WebsocketEvent(WebSocketEventNames.MESSAGE, { path: '/observe' })
  async handleMessage (...args: Parameters<WebsocketMiddleware>) {
    const [ctx, next] = args

    await ctx.input.params.trigger.response(ctx, { receiveMessage: '' })

    await next()
  }
}
