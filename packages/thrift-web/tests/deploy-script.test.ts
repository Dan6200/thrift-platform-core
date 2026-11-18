import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
)

describe('Cloudflare deploy script', () => {
  it('builds OpenNext then deploys without remote cache prepopulation', () => {
    assert.match(packageJson.scripts.deploy, /opennextjs-cloudflare build/)
    assert.match(
      packageJson.scripts.deploy,
      /OPEN_NEXT_DEPLOY=true wrangler deploy/,
    )
  })
})
