import { ResponseData, ResponseDataStatus } from '../types'
import _ from 'lodash'
import { SERVICE_DEFAULT_RESPONSE_CODE, SERVICE_DEFAULT_RESPONSE_MESSAGE } from '../constants'

export function formatResponseData<T extends ResponseData = ResponseData>(data: Partial<T>): T {
  return _.merge(
    {
      status: ResponseDataStatus.SUCCESS,
      code: SERVICE_DEFAULT_RESPONSE_CODE,
      message: SERVICE_DEFAULT_RESPONSE_MESSAGE
    },
    data
  ) as T
}
