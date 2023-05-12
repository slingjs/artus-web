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
import { MongoSeed } from '../../frameworks/framework-web/models/casbin/mongo-seed'

@LifecycleHookUnit()
export default class FrameworkWebLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CLIENT)
  webClient: FrameworkWebClient

  @LifecycleHook()
  public async didReady() {
    const accountService = this.app.container.get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService
    let enforcer = await accountService.getCasbinEnforcer({ withCache: true })
    const adapterStr = fs
      .readFileSync(path.resolve(__dirname, '../../frameworks/framework-web/models/casbin/account/policy.ini'))
      .toString('utf-8')

    await enforcer.setAdapter(await new StringAdapter(adapterStr))
    // Need this step to make the policy effective.
    await enforcer.loadPolicy()

    await enforcer.enableLog(true)

    await enforcer.enforce('sling', 'data2', 'read') // True.
    // Remove.
    await enforcer.removePolicy('SUPER_ADMIN', 'data2', 'read')
    await enforcer.enforce('sling', 'data2', 'read') // False.

    // ReGet. Try cache.
    enforcer = await accountService.getCasbinEnforcer({ withCache: true })
    const enforceContext = await newEnforceContext('2')
    // enforceContext.eType = 'e';
    await enforcer.enforce(enforceContext, { age: 52 }, '/data1', 'write') // True.

    // const newEnforcer = await casbin.newEnforcer(modelStr, 'p, sling, data1, allow')
    //
    // await newEnforcer.addNamedPolicy('p2', 'r2.sub.Age > 18 && r2.sub.Age < 60', '/data1', 'read', 'allow')
    // const newEnforcerC = await newEnforceContext('2')
    // // enforceContext.eType = 'e';
    // const c = await enforcer.enforce(newEnforcerC, { Age: 70 }, '/data1', 'read')
    //
    // console.log(c)

    await (this.app.container.get(MongoSeed) as MongoSeed).init()
  }
}
