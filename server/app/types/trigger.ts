import { BaseContext } from '@artus/pipeline'

export interface TriggerType {
  use(...args): void | Promise<void>

  initContext(...args): BaseContext | Promise<BaseContext>

  startPipeline(...args): Promise<void>
}
