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
