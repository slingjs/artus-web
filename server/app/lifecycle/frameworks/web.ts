import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE, ARTUS_FRAMEWORK_WEB_CLIENT } from '../../frameworks/framework-web/types'
import { FrameworkWebClient } from '../../frameworks/framework-web/client'
import { newEnforceContext, StringAdapter } from 'casbin'
import fs from 'fs'
import path from 'path'
import { AccountService } from '../../frameworks/framework-web/services/account'

@LifecycleHookUnit()
export default class FrameworkWebLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CLIENT)
  webClient: FrameworkWebClient

  @LifecycleHook()
  public async didReady() {
    const accountService = this.app.container.get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService
    const enforcer = await accountService.getCasbinEnforcer()
    const adapterStr = fs
      .readFileSync(path.resolve(__dirname, '../../frameworks/framework-web/models/casbin/account/test-policy.ini'))
      .toString('utf-8')

    enforcer.setAdapter(await new StringAdapter(adapterStr))

    const a = await enforcer.enforce('sling', 'data2', 'read')
    console.log(a)

    const enforceContext = await newEnforceContext('2')
    // enforceContext.eType = 'e';
    const b = await enforcer.enforce(enforceContext, { age: 52 }, '/data1', 'write')

    console.log(b)

    // const newEnforcer = await casbin.newEnforcer(modelStr, 'p, sling, data1, allow')
    //
    // await newEnforcer.addNamedPolicy('p2', 'r2.sub.Age > 18 && r2.sub.Age < 60', '/data1', 'read', 'allow')
    // const newEnforcerC = await newEnforceContext('2')
    // // enforceContext.eType = 'e';
    // const c = await enforcer.enforce(newEnforcerC, { Age: 70 }, '/data1', 'read')
    //
    // console.log(c)
  }
}
