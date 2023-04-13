import { WebsocketController, WebsocketEvent } from '../../../../plugins/plugin-websocket/decorator'
import { ArtusApplication, ArtusInjectEnum, Inject } from '@artus/core'
import { WebSocketEventNames, WebsocketMiddleware } from '../../../../plugins/plugin-websocket/types'

@WebsocketController('/ws/user')
export default class AccountWsController {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @WebsocketEvent(WebSocketEventNames.CONNECTION, { path: '/observe' })
  async handleConnection (...args: Parameters<WebsocketMiddleware>) {
    const [ctx, _next] = args

    await ctx.input.params.trigger.response(ctx, { test: 1 })
  }
}
