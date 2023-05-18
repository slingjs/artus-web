import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import {
  accountChangePwdPayloadSchema,
  accountSignInPayloadSchema,
  accountSignUpPayloadSchema
} from '../schemas/account'

const ajv = new Ajv()
addFormats(ajv)

export const validateAccountSignInPayload = ajv.compile(accountSignInPayloadSchema)
export const validateAccountSignUpPayload = ajv.compile(accountSignUpPayloadSchema)
export const validateAccountChangePwdPayload = ajv.compile(accountChangePwdPayloadSchema)
