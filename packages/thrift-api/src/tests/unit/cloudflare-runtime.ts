import chai from 'chai'

chai.should()

export default () => {
  it('defers Hyperdrive access until first request and initializes the app once', async () => {
    const runtime = await import('../../worker/runtime-config.js').catch(
      (): null => null,
    )

    chai.expect(runtime).to.not.equal(null)
    if (runtime == null) return

    let requestStarted = false
    let appInitializationCount = 0
    const connectionString = 'postgres://hyperdrive.test/db'
    const hyperdrive = Object.defineProperty({}, 'connectionString', {
      get: () => {
        chai.expect(requestStarted).to.equal(true)
        return connectionString
      },
    })
    const bindings = { HYPERDRIVE: hyperdrive }
    const environment: Record<string, string | undefined> = {}
    const initializeApplication =
      runtime.createCloudflareApplicationInitializer(async () => {
        appInitializationCount += 1
        environment.SUPABASE_DB_URL.should.equal(connectionString)
        return 'app'
      }, environment)

    appInitializationCount.should.equal(0)
    requestStarted = true
    const applications = await Promise.all([
      initializeApplication(bindings),
      initializeApplication(bindings),
    ])

    applications.should.deep.equal(['app', 'app'])
    appInitializationCount.should.equal(1)
  })

  it('provides the Hyperdrive connection string before app initialization', async () => {
    const runtime = await import('../../worker/runtime-config.js').catch(
      (): null => null,
    )

    chai.expect(runtime).to.not.equal(null)
    if (runtime == null) return

    const target: Record<string, string> = {}
    runtime.configureCloudflareRuntime(
      { HYPERDRIVE: { connectionString: 'postgres://hyperdrive.test/db' } },
      target,
    )

    target.SUPABASE_DB_URL.should.equal('postgres://hyperdrive.test/db')
    target.NODE_ENV.should.equal('production')
    target.CLOUDFLARE_WORKERS.should.equal('true')
  })
}
