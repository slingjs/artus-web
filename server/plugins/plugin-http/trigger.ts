import { Injectable, ScopeEnum, Trigger } from '@artus/core'
import { Stream } from 'stream'
import { ARTUS_PLUGIN_HTTP_TRIGGER, HTTPMiddleware } from './types'

@Injectable({
  id: ARTUS_PLUGIN_HTTP_TRIGGER,
  scope: ScopeEnum.SINGLETON
})
export class HTTPTrigger extends Trigger {
  constructor () {
    super()
    const run: HTTPMiddleware = async (ctx, next) => {
      await next()

      return await this.response(ctx, next)
    }

    this.use(run)
  }

  async response (...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    const { input: { params: { res } }, output: { data: { status, body } } } = ctx

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
}
