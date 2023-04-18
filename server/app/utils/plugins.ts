import _ from 'lodash'
import { AppConfig } from '../types'
import { RESERVED_PLUGIN_PROPS } from '../constants'

export function filterPluginConfig(config: AppConfig['plugin'][keyof AppConfig['plugin']]) {
  return _.omit(config, RESERVED_PLUGIN_PROPS)
}
