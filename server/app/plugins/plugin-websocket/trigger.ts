import { Injectable, ScopeEnum, Trigger } from '@artus/core'
import { ARTUS_PLUGIN_WEBSOCKET_TRIGGER, WebsocketMiddleware } from './types'
import { Pipeline } from '@artus/pipeline'

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

      const { output: { data: { __modified__: modified } } } = ctx

      if (this.handlePipeline && !modified) {
        await this.handlePipeline.run(ctx)
      }

      await this.response(ctx, next)
    }

    this.use(websocketTriggerRun)
  }

  async response (...args: Parameters<WebsocketMiddleware>) {
    const [ctx, _next] = args

    const { input: { params: { socket } }, output: { data: { body } } } = ctx

    if (Buffer.isBuffer(body) || typeof body === 'string') {
      socket.send(body)

      return
    }

    socket.send(JSON.stringify(body))
  }

  setHandlePipeline (pipeline: WebsocketTrigger['pipeline']) {
    this.handlePipeline = pipeline
  }
}
