import { Handler, HTTPVersion } from 'find-my-way'

export interface HTTPConfig {
  host: string
  port: number
}

export const ARTUS_PLUGIN_HTTP_CLIENT = 'ARTUS_PLUGIN_HTTP_CLIENT'

export type HTTPHandler = Handler<HTTPVersion.V1>
export type HTTPHandlerAsync = AsyncGenerator<HTTPHandler>
export type HTTPHandlerUnit = HTTPHandlerAsync | HTTPHandler
