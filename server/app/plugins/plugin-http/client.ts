import http from 'http'
import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import Router from 'find-my-way'
import {
  ARTUS_PLUGIN_HTTP_CLIENT,
  ARTUS_PLUGIN_HTTP_TRIGGER,
  CONTROLLER_METADATA,
  HTTPConfig,
  HTTPControllerMetadata, HTTPMiddlewareContext,
  HTTPRouteMetadata,
  HTTPRouteMiddlewaresMetadata,
  ROUTER_METADATA,
  WEB_CONTROLLER_TAG,
  WEB_MIDDLEWARE_METADATA
} from './types'
import url from 'url'
import { HTTPTrigger } from './trigger'
import { Input, Output, Middleware, Pipeline } from '@artus/pipeline'
import _ from 'lodash'

@Injectable({
  id: ARTUS_PLUGIN_HTTP_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class PluginHTTPClient {
  @Inject(ArtusInjectEnum.Application)
  private readonly app: ArtusApplication

  private server: http.Server
  private readonly router = Router()

  // 读取已经附加 metadata 信息并注入到 container 的 controller
  public async init (config: HTTPConfig) {
    const controllerClazzList = _.orderBy(
      this.app.container.getInjectableByTag(WEB_CONTROLLER_TAG),
      function(controllerClazz) {
        const controllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA, controllerClazz) as HTTPControllerMetadata

        return controllerMetadata.order
      },
      'desc'
    )

    for (const controllerClazz of controllerClazzList) {
      const controllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA, controllerClazz) as HTTPControllerMetadata
      const controller = this.app.container.get(controllerClazz) as FunctionConstructor
      // Controller Middlewares.
      const controllerMiddlewaresMetadata = (
        Reflect.getMetadata(
          WEB_MIDDLEWARE_METADATA,
          controllerClazz
        ) ?? []
      ) as HTTPRouteMiddlewaresMetadata

      // 读取 Controller 中的 Function.
      const handlerDescriptorList = Object.getOwnPropertyDescriptors(controllerClazz.prototype)
      for (const key of Object.keys(handlerDescriptorList)) {
        const handlerDescriptor = handlerDescriptorList[key]

        const routeMetadataList = (
          Reflect.getMetadata(ROUTER_METADATA, handlerDescriptor.value) ?? []
        ) as HTTPRouteMetadata
        if (!routeMetadataList.length) {
          continue
        }

        // Route Middlewares.
        const routeMiddlewaresMetadata = (
          Reflect.getMetadata(
            WEB_MIDDLEWARE_METADATA,
            handlerDescriptor.value
          ) ?? []
        ) as HTTPRouteMiddlewaresMetadata

        // 注入 router.
        this.registerRoute(
          controllerMetadata,
          routeMetadataList,
          controllerMiddlewaresMetadata.concat(routeMiddlewaresMetadata),
          controller[key].bind(controller)
        )
      }
    }

    // 启动 HTTP Server.
    this.server = http.createServer((req, res) => {
      this.router.lookup(req, res)
    })

    const { host, port } = config
    this.server.listen(port, host, () => {
      // @ts-ignore
      this.app.logger.info(`Server listening on: ${ url.format({ hostname: host, port, protocol: 'http' }) }`)
    })

    return this.server
  }

  public getServer () {
    return this.server
  }

  private registerRoute (
    controllerMetadata: HTTPControllerMetadata,
    routeMetadataList: HTTPRouteMetadata,
    routeMiddlewaresMetadata: HTTPRouteMiddlewaresMetadata,
    handler: Middleware
  ) {
    for (const routeMetadata of routeMetadataList) {
      const routePath = (controllerMetadata.prefix ?? '/') + routeMetadata.path
      const trigger = this.app.container.get(ARTUS_PLUGIN_HTTP_TRIGGER) as HTTPTrigger
      const app = this.app
      this.router.on(
        routeMetadata.method,
        routePath,
        async function(req, res, params, store, searchParams) {
          const input = new Input() as HTTPMiddlewareContext['input']
          input.params = {
            req,
            res,
            params,
            store,
            searchParams,
            app
          }

          const output = new Output() as HTTPMiddlewareContext['output']
          output.data = {
            __status__: undefined,
            get status () {
              return this.__status__
            },
            set status (val: any) {
              this.__modified__ = true
              this.__status__ = val
            },
            __body__: undefined,
            get body () {
              return this.__body__
            },
            set body (val: any) {
              this.__modified__ = true
              this.__body__ = val
            },
            __modified__: false
          }

          const ctx = await trigger.initContext(input, output)

          const pipeline = new Pipeline()
          for (const middlewares of routeMiddlewaresMetadata) {
            await pipeline.use(middlewares)
          }

          await pipeline.use(handler)

          trigger.setHandlePipeline(pipeline)

          await trigger.startPipeline(ctx)
            .catch(e => {
              app.logger.error(e)
            })
            .finally(() => {
              trigger.setHandlePipeline(null)
            })
        }
      )
    }
  }
}
