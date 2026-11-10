import chai from 'chai'

chai.should()

export default () => {
  it('provides the Hyperdrive connection string before app initialization', async () => {
    const runtime = await import('../../worker/runtime-config.js').catch(
      () => null,
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
  })
}
