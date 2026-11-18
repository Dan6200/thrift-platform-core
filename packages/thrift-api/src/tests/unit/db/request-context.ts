import { expect } from 'chai'
import {
  databaseContext,
  createDatabaseHandles,
  withDatabaseRequest,
} from '../../../db/request-context.js'

export default () => {
  it('isolates overlapping requests and preserves context after await', async () => {
    const instances: unknown[] = []
    await Promise.all(
      [1, 2].map(() =>
        withDatabaseRequest(async () => {
          const handles = databaseContext.getStore()!
          instances.push(handles.knex)
          await new Promise((resolve) => setTimeout(resolve, 5))
          expect(databaseContext.getStore()).to.equal(handles)
        }),
      ),
    )
    expect(instances[0]).not.to.equal(instances[1])
    expect(databaseContext.getStore()).to.equal(undefined)
  })
  it('destroys the request pool after success and failure', async () => {
    for (const shouldFail of [false, true]) {
      let handles: ReturnType<typeof createDatabaseHandles> | undefined
      try {
        await withDatabaseRequest(async () => {
          handles = databaseContext.getStore()
          if (shouldFail) throw new Error('handler failed')
        })
        expect(shouldFail).to.equal(false)
      } catch (error) {
        expect((error as Error).message).to.equal('handler failed')
      }
      expect(handles!.knex.client.pool).to.equal(undefined)
    }
  })
}
