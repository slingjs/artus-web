import { Handler, HTTPVersion } from 'find-my-way'
import { BaseContext, Middleware, BaseInput, BaseOutput } from '@artus/pipeline'
import { Stream } from 'stream'
import { ArtusApplication } from '@artus/core'
import { HTTPControllerMetadata, HTTPRouteMetadata } from './decorator'
import { ArrayMember } from '@sling/artus-web-shared/types'

export interface HTTPConfig {
  host: string
  port: number
  requestPathCaseSensitive: boolean
}

export const ARTUS_PLUGIN_HTTP_CLIENT = 'ARTUS_PLUGIN_HTTP_CLIENT'
export const ARTUS_PLUGIN_HTTP_TRIGGER = 'ARTUS_PLUGIN_HTTP_TRIGGER'

export type HTTPHandler = Handler<HTTPVersion.V1>

export type HTTPHandlerArguments = Parameters<HTTPHandler>

export type HTTPHandlerArgumentsRecord = {
  req: HTTPHandlerArguments[0] & Partial<{ body: any }>
  res: HTTPHandlerArguments[1]
  params: HTTPHandlerArguments[2]
  store: HTTPHandlerArguments[3]
  searchParams: HTTPHandlerArguments[4]
  app: ArtusApplication
  metadata: {
    controller: HTTPControllerMetadata
    route: ArrayMember<HTTPRouteMetadata>
  }
}

export type HTTPHandlerOutputData = {
  body: undefined | string | object | Stream
  __body__: HTTPHandlerOutputData['body']
  status: number | undefined
  __status__: HTTPHandlerOutputData['status']
  __modified__: boolean
}

export interface HTTPMiddlewareContext extends Required<BaseContext> {
  input: Required<BaseInput<HTTPHandlerArgumentsRecord>>
  output: Required<BaseOutput<HTTPHandlerOutputData>>
}

export type HTTPMiddleware = Middleware<HTTPMiddlewareContext>
