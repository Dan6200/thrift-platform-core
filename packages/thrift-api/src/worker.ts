import { httpServerHandler } from 'cloudflare:node'
import { env } from 'cloudflare:workers'
import { createServer } from 'node:http'
import {
  configureCloudflareRuntime,
  type CloudflareRuntimeBindings,
} from './worker/runtime-config.js'

configureCloudflareRuntime(
  env as unknown as CloudflareRuntimeBindings,
  process.env,
)

const { default: app } = await import('./index.js')
const server = createServer(app)
server.listen(8080)

export default httpServerHandler({ port: 8080 })
