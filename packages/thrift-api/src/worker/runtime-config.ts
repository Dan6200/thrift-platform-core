export interface CloudflareRuntimeBindings extends Record<string, unknown> {
  HYPERDRIVE: {
    connectionString: string
  }
}

export function configureCloudflareRuntime(
  bindings: CloudflareRuntimeBindings,
  environment: Record<string, string | undefined>,
): void {
  environment.SUPABASE_DB_URL = bindings.HYPERDRIVE.connectionString
  environment.NODE_ENV = 'production'
  environment.CLOUDFLARE_WORKERS = 'true'
}

export function createCloudflareApplicationInitializer<T>(
  initializeApplication: () => Promise<T>,
  environment: Record<string, string | undefined>,
): (bindings: CloudflareRuntimeBindings) => Promise<T> {
  let initialization: Promise<T> | undefined

  return (bindings) => {
    if (initialization != null) return initialization

    initialization = (async () => {
      configureCloudflareRuntime(bindings, environment)
      return await initializeApplication()
    })()

    void initialization.catch(() => {
      initialization = undefined
    })

    return initialization
  }
}
