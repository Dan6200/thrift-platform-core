// Run with Playwright MCP browser_run_code_unsafe(filename); no mocked services.
async function auditSearch(page) {
  const origin = 'https://thrift-classical-search-stajxdef6a-uc.a.run.app'
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://web.thrift-commerce.workers.dev', {
    waitUntil: 'domcontentloaded',
  })
  const input = page.getByRole('searchbox')
  await input.waitFor()
  const pending = page.waitForResponse(
    (response) =>
      response.url().startsWith(origin) &&
      response.request().method() === 'POST',
    { timeout: 20000 },
  )
  await input.fill('dress')
  const response = await pending
  if (!response.ok())
    throw new Error(`Search returned HTTP ${response.status()}`)
  const body = await response.json()
  const hits =
    body.results?.flatMap((result) => result.hits ?? []) ?? body.hits ?? []
  if (!hits.length)
    throw new Error('Live search returned no products for dress')
  await page.getByRole('link', { name: /dress/i }).first().waitFor()
  return { origin, status: response.status(), hits: hits.length }
}
