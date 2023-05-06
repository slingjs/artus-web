import { start } from './app/bootstrap'

const run = async () => {
  return await start()
}

run().catch(e => {
  console.error('[Fatal] Failed to start app.', e)
})
