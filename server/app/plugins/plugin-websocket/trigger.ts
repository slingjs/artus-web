import { Injectable, ScopeEnum, Trigger } from '@artus/core'
import {
  ARTUS_PLUGIN_WEBSOCKET_TRIGGER,
  WebsocketEventResponseBody,
  WebsocketMiddleware,
  WebsocketMiddlewareContext
} from './types'
import { Pipeline } from '@artus/pipeline'
import ws from 'ws'

@Injectable({
  id: ARTUS_PLUGIN_WEBSOCKET_TRIGGER,
  scope: ScopeEnum.SINGLETON
})
export class WebsocketTrigger extends Trigger {
  private handlePipeline: Pipeline | null

  constructor () {
    super()

    const websocketTriggerRun: WebsocketMiddleware = async (ctx, next) => {
      await next()

      if (this.handlePipeline) {
        await this.handlePipeline.run(ctx)
      }
    }

    this.use(websocketTriggerRun)
  }

  async response (ctx: WebsocketMiddlewareContext, body: WebsocketEventResponseBody) {
    const { input: { params: { socket } }, output: { data } } = ctx

    data.lastMessage = body

    return this.send(socket, body)
  }

  async send (socket: ws.WebSocket, body: WebsocketEventResponseBody) {
    if (Buffer.isBuffer(body) || typeof body === 'string') {
      socket.send(body.toString())

      return
    }

    socket.send(JSON.stringify(body))
  }

  setHandlePipeline (pipeline: WebsocketTrigger['pipeline']) {
    this.handlePipeline = pipeline
  }
}
