export interface FetchAccountSignInRequestPayload {
  email: string
  password: string
}

export interface FetchAccountSignUpRequestPayload {
  email: string
  password: string
  name: string
}

export interface FetchAccountChangePwdRequestPayload {
  email: string
  password: string
  oldPassword: string
}
