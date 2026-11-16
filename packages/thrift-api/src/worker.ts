import { handleAsNodeRequest } from 'cloudflare:node'
import { createServer } from 'node:http'
import {
  createCloudflareApplicationInitializer,
  type CloudflareRuntimeBindings,
} from './worker/runtime-config.js'

const initializeApplication = createCloudflareApplicationInitializer(
  async () => {
    const { default: app } = await import('./index.js')
    const server = createServer(app)
    server.listen(8080)
  },
  process.env,
)

export default {
  async fetch(
    request: Request,
    bindings: CloudflareRuntimeBindings,
  ): Promise<Response> {
    await initializeApplication(bindings)
    return await handleAsNodeRequest(8080, request)
  },
}
