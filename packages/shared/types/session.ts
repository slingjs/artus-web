export enum Roles {
  ANONYMOUS = 'ANONYMOUS',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface UserSession {
  name: string
  roles: Array<Roles>
  signedIn: boolean
  id: string
  email: string
  _sessionId: string
}

export enum WebsocketUserSessionClientCommandType {
  SET_COOKIE = 'set-cookie'
}

export enum WebsocketUserSessionClientCommandTrigger {
  SYSTEM = 'system',
  CLIENT = 'client'
}

export interface WebsocketUserSessionClientCommandInfo {
  trigger: WebsocketUserSessionClientCommandTrigger
  command: WebsocketUserSessionClientCommandType
  value: string
}
