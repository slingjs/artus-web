import {
  WebsocketController,
  WebsocketEvent,
  WebsocketUse
} from '../../../../plugins/plugin-websocket/decorator'
import {
  ARTUS_PLUGIN_WEBSOCKET_CLIENT,
  WebSocketEventNames,
  WebsocketMiddleware
} from '../../../../plugins/plugin-websocket/types'
import { executionTimeMiddleware } from '../../middlewares/common/execution-time'
import { WebsocketClient } from '../../../../plugins/plugin-websocket/client'
import { initUser } from '../../middlewares/business/account'
import {
  WebsocketUserSessionClientCommandInfo,
  WebsocketUserSessionClientCommandTrigger,
  WebsocketUserSessionClientCommandType
} from '@sling/artus-web-shared/types'

@WebsocketController('/ws/account')
@WebsocketUse([executionTimeMiddleware<WebsocketMiddleware>(), initUser<WebsocketMiddleware>()])
export default class AccountWsController {
  @WebsocketEvent(WebSocketEventNames.CONNECTION, { path: '/observe' })
  async handleConnection(...args: Parameters<WebsocketMiddleware>) {
    const [ctx, next] = args

    await ctx.input.params.trigger.response(ctx, {
      command: WebsocketUserSessionClientCommandType.MESSAGE_NOTIFY,
      value: 'Websocket session connected!',
      trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM
    } as WebsocketUserSessionClientCommandInfo)

    await next()
  }

  @WebsocketEvent(WebSocketEventNames.MESSAGE, { path: '/observe' })
  async handleMessage(...args: Parameters<WebsocketMiddleware>) {
    const [ctx, next] = args

    await ctx.input.params.trigger.response(ctx, { receiveMessage: '' })

    await next()
  }

  @WebsocketEvent(WebSocketEventNames.MESSAGE, { path: '/observe' })
  async handleMessageAndBroadcast(...args: Parameters<WebsocketMiddleware>) {
    const [ctx, next] = args

    const {
      input: {
        params: { trigger, socket, app, eventArgs }
      }
    } = ctx

    const websocketClient = app.container.get(ARTUS_PLUGIN_WEBSOCKET_CLIENT) as WebsocketClient

    const receivedMessage = eventArgs[0]
    if (receivedMessage) {
      websocketClient.getWsServerSameReqPathSockets(socket).forEach((s) => {
        trigger.send(s, receivedMessage)
      })
    }

    await next()
  }
}
