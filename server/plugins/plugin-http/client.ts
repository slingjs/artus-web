import http from 'http'
import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import Router, { Handler, HTTPVersion } from 'find-my-way'
import {
  ARTUS_PLUGIN_HTTP_CLIENT,
  CONTROLLER_METADATA, HTTPConfig,
  HTTPControllerMetadata,
  HTTPRouteMetadata,
  ROUTER_METADATA,
  WEB_CONTROLLER_TAG
} from './types'
import * as url from 'url'

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

        // 注入 router.
        this.registerRoute(controllerMetadata, routeMetadataList, controller[key].bind(controller))
      }
    }

    // 启动 HTTP Server.
    this.server = http.createServer((req, res) => {
      this.router.lookup(req, res)
    })

    const { host, port } = config
    this.server.listen(port, host, () => {
      // @ts-ignore
      this.app.logger.log(`Server listening on: ${ url.format({ host, port, protocol: 'http' }) }`)
    })

    return this.server
  }

  public getServer () {
    return this.server
  }

  private registerRoute (
    controllerMetadata: HTTPControllerMetadata,
    routeMetadataList: HTTPRouteMetadata,
    handler: Handler<HTTPVersion.V1>
  ) {
    for (const routeMetadata of routeMetadataList) {
      const routePath = (controllerMetadata.prefix ?? '/') + routeMetadata.path
      this.router.on(routeMetadata.method, routePath, handler)
    }
  }
}
