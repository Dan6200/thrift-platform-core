import chai from 'chai'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const { expect } = chai
const apiUrl = 'https://api.thrift-commerce.workers.dev'
const repoRoot = resolve(process.cwd(), '../..')

export default () => {
  it('names the web Worker and self reference consistently', () => {
    const config = readFileSync(
      resolve(repoRoot, 'packages/thrift-web/wrangler.jsonc'),
      'utf8',
    )
    expect(config).to.include('"name": "web"')
    expect(config).to.include('"service": "web"')
  })
  it('uses the active Workers hostname in API config, docs, and smoke checks', () => {
    const wranglerConfig = readFileSync(
      resolve(process.cwd(), 'wrangler.jsonc'),
      'utf8',
    )
    const apiDocs = readFileSync(
      resolve(process.cwd(), 'api-docs/dist.yaml'),
      'utf8',
    )
    const deployWorkflow = readFileSync(
      resolve(repoRoot, '.github/workflows/deploy-api-to-cloudflare.yml'),
      'utf8',
    )

    expect(wranglerConfig).to.include('"name": "api"')
    expect(wranglerConfig).to.include(`"APP_URL": "${apiUrl}"`)
    expect(apiDocs).to.include(`${apiUrl}/{basePath}`)
    expect(deployWorkflow).to.include(`${apiUrl}/api.json`)
    expect(deployWorkflow).to.include("subdomain: 'thrift-commerce'")
  })
}
