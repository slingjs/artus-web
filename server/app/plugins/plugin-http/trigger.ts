import { Injectable, ScopeEnum } from '@artus/core'
import { Pipeline } from '@artus/pipeline'
import { Stream } from 'stream'
import { ARTUS_PLUGIN_HTTP_TRIGGER, HTTPMiddleware } from './types'
import { DEFAULT_HTTP_STATUS, SUCCESS_HTTP_STATUS } from './constants'
import { Trigger } from '../../trigger'

@Injectable({
  id: ARTUS_PLUGIN_HTTP_TRIGGER,
  scope: ScopeEnum.SINGLETON
})
export class HTTPTrigger extends Trigger {
  private handlePipeline: Pipeline | null

  constructor() {
    super()
    const HTTPTriggerRun: HTTPMiddleware = async (ctx, next) => {
      await next()

      const {
        output: {
          data: { __modified__: modified }
        }
      } = ctx
      if (this.handlePipeline && !modified) {
        await this.handlePipeline.run(ctx)
      }

      return await this.response(ctx, next)
    }

    this.use(HTTPTriggerRun)
  }

  async response(...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    const {
      input: {
        params: { res }
      },
      output: {
        data: { status, body }
      }
    } = ctx

    res.statusCode = typeof status === 'number' ? status : body == null ? DEFAULT_HTTP_STATUS : SUCCESS_HTTP_STATUS

    if (Buffer.isBuffer(body) || typeof body === 'string') {
      return res.end(body)
    }

    if (body instanceof Stream) {
      return body.pipe(res)
    }

    return res.end(JSON.stringify(body))
  }

  setHandlePipeline(pipeline: HTTPTrigger['handlePipeline']) {
    this.handlePipeline = pipeline
  }
}
