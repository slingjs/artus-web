import { Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_PLUGIN_CASBIN_CLIENT, CasbinConfig } from './types'
import { Enforcer, newEnforcer, newModelFromString, StringAdapter } from 'casbin'

@Injectable({
  id: ARTUS_PLUGIN_CASBIN_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class PluginCasbinClient {
  async init(_config: CasbinConfig) {}

  private matcherInjectPreAnd() {
    return true
  }

  private matcherInjectSufOr() {
    return false
  }

  private async wrapEnforcer(enforcer: Enforcer) {
    // Add injected.
    await enforcer.addFunction('artus_inject_pre_and', this.matcherInjectPreAnd)
    await enforcer.addFunction('artus_inject_suf_or', this.matcherInjectSufOr)

    return enforcer
  }

  async newEnforcer(modelStr: string, adapterStr?: string) {
    const model = newModelFromString(modelStr)
    if (typeof adapterStr !== 'string') {
      return this.wrapEnforcer(await newEnforcer(model))
    }

    const adapter = new StringAdapter(adapterStr)
    const enforcer = await newEnforcer(model, adapter)

    return this.wrapEnforcer(enforcer)

    // return {
    //   model, // enforcer.model
    //   adapter, // enforcer.adapter
    //   enforcer
    // }
  }
}
