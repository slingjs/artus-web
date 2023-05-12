import { ARTUS_PLUGIN_PRISMA_CLIENT, PrismaPluginDataSourceName } from '../../../../plugins/plugin-prisma/types'
import { PluginPrismaClient } from '../../../../plugins/plugin-prisma/client'
import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE, PersistentDBInstance } from '../../types'
import { newEnforceContext, StringAdapter } from 'casbin'
import path from 'path'
import fs from 'fs'
import { ARTUS_PLUGIN_CASBIN_CLIENT } from '../../../../plugins/plugin-casbin/types'
import { PluginCasbinClient } from '../../../../plugins/plugin-casbin/client'
import _ from 'lodash'
import { AccountService } from '../../services/account'

@Injectable({
  scope: ScopeEnum.SINGLETON
})
export class MongoSeed {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  async judgeInitialized() {
    const prismaClient = this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient
    const mongoPrisma = prismaClient.getPrisma<PersistentDBInstance<PrismaPluginDataSourceName.MONGO>>(
      PrismaPluginDataSourceName.MONGO
    )

    return Promise.allSettled([mongoPrisma.casbinPolicy.findFirst(), mongoPrisma.casbinModel.findFirst()]).then(res => {
      return !!res.reduce((acc, cur) => {
        if ('value' in cur) {
          return acc + 1
        }

        return acc
      }, 0)
    })
  }

  async init() {
    const prismaClient = this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient
    const mongoPrisma = prismaClient.getPrisma<PersistentDBInstance<PrismaPluginDataSourceName.MONGO>>(
      PrismaPluginDataSourceName.MONGO
    )

    const casbinClient = this.app.container.get(ARTUS_PLUGIN_CASBIN_CLIENT) as PluginCasbinClient
    const enforcer = await casbinClient.newEnforcer(
      fs.readFileSync(path.resolve(__dirname, './account/model.ini')).toString('utf-8')
    )
    const policyAdapter = new StringAdapter(
      fs.readFileSync(path.resolve(__dirname, './account/policy.ini')).toString('utf-8') +
        '\r\n' +
        fs.readFileSync(path.resolve(__dirname, './account/group.ini')).toString('utf-8')
    )

    await enforcer.setAdapter(policyAdapter)
    await enforcer.loadPolicy()

    const mappings = [...enforcer.getModel().model.entries()].reduce((acc, cur) => {
      // Key. m,p,g,e,r.
      const [key, map] = cur
      const mapEntries = [...map.entries()]
      acc[key] = {
        models: mapEntries.reduce((mAcc, mCur) => {
          // mCur[0] ---> pType.
          mAcc[mCur[0]] = mCur[1].value || ''
          return mAcc
        }, {} as Record<string, string>),
        policies: mapEntries.reduce((mAcc, mCur) => {
          // mCur[0] ---> pType.
          mAcc[mCur[0]] = mCur[1].policy || []
          return mAcc
        }, {} as Record<string, string[][]>)
      }
      return acc
    }, {} as Record<string, { models: Record<string, string>; policies: Record<string, string[][]> }>)

    const policyVIdxGenerator = function (policy: string[]) {
      if (!(Array.isArray(policy) && policy.length)) {
        return
      }

      return policy.reduce((acc, cur, index) => {
        acc['v' + index] = cur
        return acc
      }, {} as Record<string, string>)
    }

    this.app.logger.info('Mongodb seed running.')

    // Save.
    await Promise.allSettled(
      _.flattenDeep(
        _.map(mappings, (map, mapPType) => {
          const { models, policies } = map

          // Model.
          const modelsJobs = _.map(models, (model, modelPType) => {
            if (!model) {
              return
            }

            return mongoPrisma.casbinModel.create({
              data: {
                bizRealm: 'service.account',
                sec: mapPType,
                pType: modelPType,
                v0: model
              }
            })
          })

          // Policy.
          const policiesJobs = _.map(policies, (policy, policyPType) => {
            return policy.map(p => {
              const pVIdxObj = policyVIdxGenerator(p)
              if (!pVIdxObj) {
                return
              }

              return mongoPrisma.casbinPolicy.create({
                data: {
                  bizRealm: 'service.account',
                  sec: mapPType,
                  pType: policyPType,
                  ...pVIdxObj
                }
              })
            })
          })

          return [modelsJobs, policiesJobs]
        })
      )
    )

    this.app.logger.info('Mongodb seed executed.')
  }

  async tests() {
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
  }
}
