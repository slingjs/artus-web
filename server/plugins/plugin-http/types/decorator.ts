export const ROUTER_METADATA = Symbol.for('ROUTER_METADATA')
export const CONTROLLER_METADATA = Symbol.for('CONTROLLER_METADATA')
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
  prefix?: string
}

export type HTTPRouteMetadata = Array<{
  path: string
  method: HTTPMethod
}>
