import http from 'http'
import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import Router from 'find-my-way'
import {
  ARTUS_PLUGIN_HTTP_CLIENT,
  ARTUS_PLUGIN_HTTP_TRIGGER,
  HTTP_CONTROLLER_METADATA,
  HTTPConfig,
  HTTPControllerMetadata,
  HTTPMiddleware,
  HTTPMiddlewareContext,
  HTTPRouteMetadata,
  HTTPRouteMiddlewaresMetadata,
  HTTP_ROUTER_METADATA,
  HTTP_CONTROLLER_TAG,
  HTTP_MIDDLEWARE_METADATA
} from './types'
import url from 'url'
import { HTTPTrigger } from './trigger'
import { Input, Output, Pipeline } from '@artus/pipeline'
import _ from 'lodash'
import bodyParser from 'body-parser'
import { HTTP_DEFAULT_BODY_PARSER_OPTIONS, HTTP_DEFAULT_BODY_PARSER_TYPE } from './constants'
import shared from '@sling/artus-web-shared'
import { trimEventPathRegExp } from './constants'

@Injectable({
  id: ARTUS_PLUGIN_HTTP_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class PluginHTTPClient {
  @Inject(ArtusInjectEnum.Application)
  private readonly app: ArtusApplication

  private server: http.Server
  private readonly router = Router()

  // Handle on retrieving registered route metadata.
  public async init (config: HTTPConfig) {
    const controllerClazzList = _.orderBy(
      this.app.container.getInjectableByTag(HTTP_CONTROLLER_TAG),
      function(controllerClazz) {
        const controllerMetadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, controllerClazz) as HTTPControllerMetadata

        return _.get(controllerMetadata, 'options.order') ?? 0
      },
      'desc'
    )

    for (const controllerClazz of controllerClazzList) {
      // Retrieve the registered metadata from the controller's generator..
      const controllerMetadata = Reflect.getMetadata(HTTP_CONTROLLER_METADATA, controllerClazz) as HTTPControllerMetadata
      const controller = this.app.container.get(controllerClazz) as FunctionConstructor
      // Controller Middlewares.
      const controllerMiddlewaresMetadata = (
        Reflect.getMetadata(
          HTTP_MIDDLEWARE_METADATA,
          controllerClazz
        ) ?? []
      ) as HTTPRouteMiddlewaresMetadata

      // Retrieve the registered metadata from controller's proto functions.
      const handlerDescriptorList = Object.getOwnPropertyDescriptors(controllerClazz.prototype)
      for (const key of Object.keys(handlerDescriptorList)) {
        const handlerDescriptor = handlerDescriptorList[key]

        const routeMetadataList = (
          Reflect.getMetadata(HTTP_ROUTER_METADATA, handlerDescriptor.value) ?? []
        ) as HTTPRouteMetadata
        if (!routeMetadataList.length) {
          continue
        }

        // Route Middlewares.
        const routeMiddlewaresMetadata = (
          Reflect.getMetadata(
            HTTP_MIDDLEWARE_METADATA,
            handlerDescriptor.value
          ) ?? []
        ) as HTTPRouteMiddlewaresMetadata

        // Inject metadata in route. Handle on route's request.
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

    await new Promise(resolve => {
      const { host, port } = config
      this.server.listen(port, host, () => {
        // @ts-ignore
        this.app.logger.info(`HTTP server listening on: ${ url.format({ hostname: host, port, protocol: 'http' }) }`)
        resolve(this.server)
      })
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
    handler: HTTPMiddleware
  ) {
    const trigger = this.app.container.get(ARTUS_PLUGIN_HTTP_TRIGGER) as HTTPTrigger
    const app = this.app

    for (const routeMetadata of routeMetadataList) {
      const routePath = (
        (controllerMetadata.prefix ?? '/') + routeMetadata.path
      ).replace(trimEventPathRegExp, '') || '/'
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

          // For body-parser.
          if (_.get(routeMetadata.options || {}, 'useBodyParser')) {
            const bodyParserOptions = _.get(routeMetadata.options || {}, 'bodyParserOptions') ??
              HTTP_DEFAULT_BODY_PARSER_OPTIONS

            const bodyParserType = _.get(routeMetadata.options || {}, 'bodyParserType') ||
              HTTP_DEFAULT_BODY_PARSER_TYPE

            await pipeline.use(async function httpBodyParser (_ctx, next) {
              const { p, resolve, reject } = shared.utils.generateOperablePromise()
              const usedBodyParserUtil = bodyParserType && _.has(bodyParser, bodyParserType)
                ? _.get(bodyParser, bodyParserType)
                : bodyParser

              try {
                usedBodyParserUtil(bodyParserOptions)(req, res, function bodyParserNext () {
                  resolve(next())
                })
              } catch (e) {
                reject(e)
              }

              return p
            })
          }

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
