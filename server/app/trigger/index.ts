import { Input, Context, MiddlewareInput, Pipeline, Output } from '@artus/pipeline'
import { Application, ArtusInjectEnum, ExecutionContainer, Inject, Injectable, ScopeEnum } from '@artus/core'
import { TriggerType } from '../types/trigger'

@Injectable({
  scope: ScopeEnum.SINGLETON
})
export class Trigger implements TriggerType {
  private pipeline: Pipeline

  @Inject(ArtusInjectEnum.Application)
  private app: Application

  constructor() {
    this.pipeline = new Pipeline()
  }

  async use(middleware: MiddlewareInput): Promise<void> {
    this.pipeline.use(middleware)
  }

  async initContext(input: Input = new Input(), output = new Output()): Promise<Context> {
    const ctx = new Context(input, output)
    ctx.container = new ExecutionContainer(ctx, this.app.container)
    ctx.container.set({
      id: ExecutionContainer,
      value: ctx.container
    })
    return ctx
  }

  async startPipeline(ctx: Context): Promise<void> {
    await this.pipeline.run(ctx)
  }
}
