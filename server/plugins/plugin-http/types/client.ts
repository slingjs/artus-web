import { Handler, HTTPVersion } from 'find-my-way'

export interface HTTPConfig {
  host: string
  port: number
}

export const ARTUS_PLUGIN_HTTP_CLIENT = 'ARTUS_PLUGIN_HTTP_CLIENT'
export const ARTUS_PLUGIN_HTTP_TRIGGER = 'ARTUS_PLUGIN_HTTP_TRIGGER'
export const ARTUS_PLUGIN_HTTP_ROUTER_HANDLER = 'ARTUS_PLUGIN_HTTP_ROUTER_HANDLER'

export type HTTPHandler = Handler<HTTPVersion.V1>
export type HTTPHandlerAsync = AsyncGenerator<HTTPHandler>
export type HTTPHandlerUnit = HTTPHandlerAsync | HTTPHandler
