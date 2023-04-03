import http from 'http'
import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import Router from 'find-my-way'
import {
  ARTUS_PLUGIN_HTTP_CLIENT,
  ARTUS_PLUGIN_HTTP_ROUTER_HANDLER,
  ARTUS_PLUGIN_HTTP_TRIGGER,
  CONTROLLER_METADATA,
  HTTPConfig,
  HTTPControllerMetadata,
  HTTPRouteMetadata,
  HTTPRouteMiddlewaresMetadata,
  ROUTER_METADATA,
  WEB_CONTROLLER_TAG,
  WEB_MIDDLEWARE_METADATA
} from './types'
import * as url from 'url'
import { Middleware } from '@artus/pipeline/src/base'
import { HTTPTrigger } from './trigger'
import { ARTUS_WEB_APP } from '../../types'

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
    const controllerClazzList = this.app.container.getInjectableByTag(WEB_CONTROLLER_TAG)

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
      this.app.logger.info(`Server listening on: ${ url.format({ host, port, protocol: 'http' }) }`)
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
          const ctx = await trigger.initContext()

          const artusWebAppStorage = ctx.namespace(ARTUS_WEB_APP)
          artusWebAppStorage.set(app, 'app')

          const routeHandlerStorage = ctx.namespace(ARTUS_PLUGIN_HTTP_ROUTER_HANDLER)
          routeHandlerStorage.set(req, 'req')
          routeHandlerStorage.set(res, 'res')
          routeHandlerStorage.set(params, 'params')
          routeHandlerStorage.set(store, 'store')
          routeHandlerStorage.set(searchParams, 'searchParams')
          routeHandlerStorage.set(arguments, 'routeHandlerArguments')

          for (const middlewares of routeMiddlewaresMetadata) {
            await trigger.use(middlewares)
          }

          await trigger.use(handler)

          await trigger.startPipeline(ctx)
            .catch(e => {
              app.logger.error(e)
            })
        }
      )
    }
  }
}
