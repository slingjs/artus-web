import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import {
  ARTUS_PLUGIN_WEBSOCKET_CLIENT,
  ARTUS_PLUGIN_WEBSOCKET_TRIGGER,
  WEBSOCKET_CONTROLLER_METADATA,
  WEBSOCKET_CONTROLLER_TAG,
  WEBSOCKET_EVENT_METADATA,
  WEBSOCKET_MIDDLEWARE_METADATA,
  WEBSOCKET_SOCKET_REQUEST_URL_OBJ_KEY,
  WebsocketConfig,
  WebsocketControllerMetadata,
  WebsocketEventMetadata,
  WebsocketEventMiddlewaresMetadata,
  WebSocketEventNames,
  WebsocketEventRules,
  WebsocketMiddlewareContext
} from './types'
import http from 'http'
import _ from 'lodash'
import ws from 'ws'
import url from 'url'
import { WebsocketTrigger } from './trigger'
import { Input, Output, Pipeline } from '@artus/pipeline'
import type { AddressInfo } from 'net'
import { trimEventPathRegExp } from './constants'
import shared from '@sling/artus-web-shared'

@Injectable({
  id: ARTUS_PLUGIN_WEBSOCKET_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class WebsocketClient {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  private server: http.Server
  private wsServer: ws.WebSocketServer

  get supportedSocketEventNames () {
    return Object.values(WebSocketEventNames)
      .filter(eventName => eventName !== WebSocketEventNames.CONNECTION)
  }

  async init (config: WebsocketConfig, options?: Partial<{ existedServer: http.Server }>) {
    const serverListen = () => {
      const { host, port } = config
      return new Promise(function(resolve) {
        server.listen(port, host, () => resolve(server))
      })
    }

    let server: http.Server = _.get(options, 'existedServer')!
    if (!server) {
      server = http.createServer()
    }

    this.server = server

    if (!server.listening) {
      await serverListen()
    }

    const address = server.address() as AddressInfo
    // @ts-ignore
    this.app.logger.info(
      `Websocket server listening on: ${ url.format({ hostname: address.address, port: address.port, protocol: 'ws' }) }`
    )

    this.wsServer = new ws.WebSocketServer({ server })

    this.registerEvents()
  }

  getServer () {
    return this.server
  }

  getWsServer () {
    return this.wsServer
  }

  getWsServerSockets (options?: Partial<{ filter: Parameters<Array<ws.WebSocket>['filter']>[0] }>) {
    const currentAllClients = Array.from(this.wsServer.clients.values())

    const condition = _.get(options, 'filter')
    if (typeof condition !== 'function') {
      return currentAllClients
    }

    return currentAllClients.filter(condition)
  }

  getWsServerSameReqPathSockets (targetSocket: ws.WebSocket, options?: Partial<{ reqPathCaseInsensitive: boolean }>) {
    return this.getWsServerSockets({
      filter (socket) {
        if (socket === targetSocket) {
          return false
        }

        const targetSocketReqUrlObj = _.get(
          targetSocket,
          WEBSOCKET_SOCKET_REQUEST_URL_OBJ_KEY
        ) as url.UrlWithStringQuery
        if (!targetSocketReqUrlObj) {
          return false
        }

        const socketReqUrlObj = _.get(socket, WEBSOCKET_SOCKET_REQUEST_URL_OBJ_KEY) as url.UrlWithStringQuery
        if (!socketReqUrlObj) {
          return false
        }

        if (_.get(options, 'reqPathCaseInsensitive')) {
          return shared.utils.compareIgnoreCase(socketReqUrlObj.path, targetSocketReqUrlObj.path)
        }

        return socketReqUrlObj.path === targetSocketReqUrlObj.path
      }
    })
  }

  initializeEventRules () {
    const eventRules: WebsocketEventRules = new Map()

    const wsControllerClazzList = _.orderBy(
      this.app.container.getInjectableByTag(WEBSOCKET_CONTROLLER_TAG) as Array<FunctionConstructor>,
      function(controllerClazz) {
        const controllerMetadata = Reflect.getMetadata(
          WEBSOCKET_CONTROLLER_METADATA,
          controllerClazz
        ) as WebsocketControllerMetadata

        return _.get(controllerMetadata, 'options.order') ?? 0
      }
    )

    for (const controllerClazz of wsControllerClazzList) {
      const controllerMetadata = Reflect.getMetadata(
        WEBSOCKET_CONTROLLER_METADATA,
        controllerClazz
      ) as WebsocketControllerMetadata
      const controller = this.app.container.get(controllerClazz) as FunctionConstructor
      const controllerMiddlewaresMetadata: WebsocketEventMiddlewaresMetadata = Reflect.getMetadata(
        WEBSOCKET_MIDDLEWARE_METADATA,
        controllerClazz
      ) ?? []

      // Retrieve the registered metadata from controller's proto functions.
      const handlerDescriptionList = Object.getOwnPropertyDescriptors(controllerClazz.prototype)
      for (const key of Object.keys(handlerDescriptionList)) {
        const handlerDescriptor = handlerDescriptionList[key]

        const eventMetadata: WebsocketEventMetadata = Reflect.getMetadata(
          WEBSOCKET_EVENT_METADATA,
          handlerDescriptor.value
        )
        if (!(eventMetadata && typeof eventMetadata.eventName === 'string')) {
          continue
        }

        // Event middlewares.
        const eventMiddlewaresMetadata: WebsocketEventMiddlewaresMetadata = Reflect.getMetadata(
          WEBSOCKET_MIDDLEWARE_METADATA,
          handlerDescriptor.value
        ) ?? []

        // Get the registered data with the target path.
        const eventPath = (
          (controllerMetadata.prefix ?? '/') + (_.get(eventMetadata, 'options.path') ?? '')
        ).replace(trimEventPathRegExp, '') || '/'
        let eventPathRuleItemWithEventPath = eventRules.get(eventPath)
        // Non existent -> Initialize.
        if (!(eventPathRuleItemWithEventPath instanceof Map)) {
          eventPathRuleItemWithEventPath = new Map()
          eventRules.set(eventPath, eventPathRuleItemWithEventPath)
        }

        // Get the registered data with the target event name.
        const eventName = eventMetadata.eventName
        let eventPathRuleItemWithEventName = eventPathRuleItemWithEventPath.get(eventName)
        if (!eventPathRuleItemWithEventName) {
          eventPathRuleItemWithEventName = {
            event: eventName,
            metadata: [],
            global: {
              middlewares: controllerMiddlewaresMetadata
            }
          }
          eventPathRuleItemWithEventPath.set(eventName, eventPathRuleItemWithEventName)
        }

        // Register.
        eventPathRuleItemWithEventName.metadata.push({
          handler: controller[key].bind(controller),
          middlewares: eventMiddlewaresMetadata,
          options: eventMetadata.options
        })

        // Order.
        if (eventPathRuleItemWithEventName.metadata.length > 1) {
          eventPathRuleItemWithEventName.metadata = _.orderBy(
            eventPathRuleItemWithEventName.metadata,
            function(metadata) {
              return _.get(metadata, 'options.order') ?? 0
            }
          )
        }
      }
    }

    return eventRules
  }

  registerEvents () {
    const eventRules = this.initializeEventRules()
    const app = this.app
    const trigger = this.app.container.get(ARTUS_PLUGIN_WEBSOCKET_TRIGGER) as WebsocketTrigger

    this.wsServer.on('connection', async (socket, req) => {
      const handleOnException = function(message: string = 'Something went wrong.') {
        socket.send(message)
        socket.send('Socket shutting down...')
        socket.close()
      }

      const reqUrl = req.url
      if (reqUrl == null) {
        handleOnException()
        return
      }

      const reqUrlObj = url.parse(reqUrl || '/')
      if (!reqUrlObj.path) {
        handleOnException()
        return
      }

      // Store some vital metrics.
      _.set(socket, WEBSOCKET_SOCKET_REQUEST_URL_OBJ_KEY, reqUrlObj);

      const matchedEventRuleItem = eventRules.get(reqUrlObj.path)
      if (!(matchedEventRuleItem && matchedEventRuleItem.size)) {
        handleOnException(`No registered handler for such path: ${ reqUrlObj.path }`)
        return
      }

      app.logger.info('New websocket connection arrived, request url: ', reqUrl)

      const enabledSocketEventNames = (Array.from(matchedEventRuleItem.keys()) as typeof this.supportedSocketEventNames)
        .filter(eventName => this.supportedSocketEventNames.includes(eventName))

      const dispatchEventGenerator = (eventName: WebsocketEventMetadata['eventName']) => {
        const matchedEventRuleItemData = matchedEventRuleItem.get(eventName)
        if (!(matchedEventRuleItemData)) {
          return function noop () {}
        }

        const dispatchEvent = async (...eventArgs: any[]) => {
          const input = new Input() as WebsocketMiddlewareContext['input']
          input.params = {
            app,
            req,
            socket,
            trigger,
            socketServer: this.wsServer,
            eventArgs,
            eventName
          }

          const output = new Output() as WebsocketMiddlewareContext['output']
          output.data = { lastMessage: undefined }

          const ctx = await trigger.initContext(input, output)
          const pipeline = new Pipeline()

          for (const globalMiddleware of matchedEventRuleItemData.global.middlewares) {
            await pipeline.use(globalMiddleware)
          }

          for (const metadata of matchedEventRuleItemData.metadata) {
            for (const middleware of metadata.middlewares) {
              await pipeline.use(middleware)
            }

            pipeline.use(metadata.handler)
          }

          trigger.setHandlePipeline(pipeline)

          await trigger.startPipeline(ctx)
            .catch(e => {
              app.logger.error(e)
            })
            .finally(() => {
              trigger.setHandlePipeline(null)
            })
        }

        return dispatchEvent
      }

      // Dispatch connection events.
      dispatchEventGenerator(WebSocketEventNames.CONNECTION)()

      // Observe socket events.
      enabledSocketEventNames.forEach(eventName => {
        socket.on(eventName, dispatchEventGenerator(eventName))
      })
    })
  }
}
