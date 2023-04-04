import { MiddlewareInput } from '@artus/pipeline/src/base'

export const ROUTER_METADATA = Symbol.for('ROUTER_METADATA')
export const CONTROLLER_METADATA = Symbol.for('CONTROLLER_METADATA')
export const WEB_MIDDLEWARE_METADATA = Symbol.for('WEB_MIDDLEWARE_METADATA')
export const WEB_CONTROLLER_TAG = 'WEB_CONTROLLER_TAG'

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PUT = 'PUT'
}

export interface HTTPControllerMetadata {
  prefix: string
  order: number
}

export type HTTPRouteMetadata = Array<{
  path: string
  method: HTTPMethod
}>

export type HTTPRouteMiddlewaresMetadata = Array<MiddlewareInput>
