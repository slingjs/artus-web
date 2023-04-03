import { Injectable, ScopeEnum, Trigger } from '@artus/core'
import { Context, Next } from '@artus/pipeline'
import { Stream } from 'stream'
import { ARTUS_PLUGIN_HTTP_ROUTER_HANDLER, ARTUS_PLUGIN_HTTP_TRIGGER } from './types'

@Injectable({
  id: ARTUS_PLUGIN_HTTP_TRIGGER,
  scope: ScopeEnum.SINGLETON
})
export class HTTPTrigger extends Trigger {
  constructor () {
    super()
    this.use(async (ctx: Context, next: Next) => {
      await next()

      return await this.response(ctx, next)
    })
  }

  async response (ctx: Context, _next: Next) {
    const handlerStorage = this.getHandlerStorage(ctx)
    const res = handlerStorage.get('res')
    const { data } = ctx.output

    const status = data.get('status')
    const body = data.get('body')

    // 404 is the fallback/default status in koa2.
    res.statusCode = typeof status === 'number'
      ? status
      : body == null
        ? 404
        : 200

    if (Buffer.isBuffer(body) || typeof body === 'string') {
      return res.end(body)
    }

    if (body instanceof Stream) {
      return body.pipe(res)
    }

    return res.end(JSON.stringify(body))
  }

  getHandlerStorage (ctx: Context) {
    return ctx.namespace(ARTUS_PLUGIN_HTTP_ROUTER_HANDLER)
  }
}
