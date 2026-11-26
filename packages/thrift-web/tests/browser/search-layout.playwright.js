// Real browser regression: opening results must not move the navbar input.
async function auditSearchLayout(page) {
  for (const width of [1024, 1318, 1440]) {
    await page.setViewportSize({ width, height: 728 })
    await page.goto('https://web.thrift-commerce.workers.dev', {
      waitUntil: 'domcontentloaded',
    })
    const input = page.getByRole('searchbox')
    await input.waitFor()
    const before = await input.boundingBox()
    await input.fill('dress')
    const close = page.getByRole('button', { name: 'Close search results' })
    await close.waitFor()
    const after = await input.boundingBox()
    if (
      Math.abs(after.y - before.y) > 1 ||
      after.y < 32 ||
      after.y + after.height > 98
    )
      throw new Error(
        `${width}px: search input moved from y=${before.y} to y=${after.y}`,
      )
    const panel = await close.locator('..').boundingBox()
    const field = await input.locator('xpath=ancestor::span[1]').boundingBox()
    if (Math.abs(panel.x + panel.width / 2 - field.x - field.width / 2) > 1)
      throw new Error(
        `${width}px: results panel is not centered under the search field`,
      )
    if (
      panel.y < after.y + after.height ||
      panel.x < 0 ||
      panel.x + panel.width > width
    )
      throw new Error(
        `${width}px: results overlap the input or overflow the viewport`,
      )
    await page.keyboard.press('Escape')
    await close.waitFor({ state: 'hidden' })
  }
  return 'Search stays inside the navbar while results open at 1024, 1318 and 1440px.'
}
