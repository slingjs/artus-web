import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import {
  ARTUS_FRAMEWORK_WEB_CACHE_SERVICE,
  ARTUS_FRAMEWORK_WEB_CASBIN_SERVICE,
  CasbinModel,
  CasbinPolicy
} from '../types'
import { CacheService } from './cache'
import { ARTUS_PLUGIN_CASBIN_CLIENT } from '../plugins/plugin-casbin/types'
import { PluginCasbinClient } from '../plugins/plugin-casbin/client'
import _ from 'lodash'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_CASBIN_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class CasbinService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CACHE_SERVICE)
  cacheService: CacheService

  @Inject(ARTUS_PLUGIN_CASBIN_CLIENT)
  client: PluginCasbinClient

  config = {
    maxModelVLevel: 6,
    maxPolicyVLevel: 6
  }

  formatModel(model: CasbinModel) {
    let modelStr = model.pType
    for (let level = 0; level < this.config.maxModelVLevel; level++) {
      const levelKey = 'v' + level
      if (!_.has(model, level)) {
        continue
      }

      modelStr += _.get(model, levelKey, '')
    }

    return modelStr
  }

  formatPolicy(policy: CasbinPolicy) {
    let policyStr = policy.pType
    for (let level = 0; level < this.config.maxPolicyVLevel; level++) {
      const levelKey = 'v' + level
      if (!_.has(policy, level)) {
        continue
      }

      policyStr += _.get(policy, levelKey, '')
    }

    return policyStr
  }

  formatModels(models: CasbinModel[]) {
    return models
      .map(m => this.formatModel(m))
      .filter(Boolean)
      .join('\r\n')
  }

  formatPolicies(policies: CasbinPolicy[]) {
    return policies
      .map(m => this.formatPolicy(m))
      .filter(Boolean)
      .join('\r\n')
  }
}
