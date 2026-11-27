// Delay a real upstream request; do not substitute a search response.
async function auditSearchLoading(page) {
  for (const [theme, width] of [
    ['Light', 1318],
    ['Dark', 1318],
    ['Light', 390],
    ['Dark', 390],
  ]) {
    let release,
      started,
      resumed,
      held = false
    const gate = new Promise((resolve) => {
      release = resolve
    })
    const pending = new Promise((resolve) => {
      started = resolve
    })
    const finished = new Promise((resolve) => {
      resumed = resolve
    })
    const handler = async (route) => {
      const body =
        route.request().method() === 'POST'
          ? route.request().postDataJSON()
          : null
      if (body?.queries?.some((query) => query.q === 'software')) {
        held = true
        started()
        await gate
        try {
          await route.continue()
        } finally {
          resumed()
        }
      } else await route.continue()
    }
    await page.route('**/multi-search*', handler)
    try {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('https://web.thrift-commerce.workers.dev', {
        waitUntil: 'domcontentloaded',
      })
      await page.waitForFunction(
        () => document.querySelector('video')?.autoplay,
      )
      if (width > 960) {
        await page
          .getByRole('button', { name: 'Toggle theme', exact: true })
          .click()
        await page.getByRole('menuitem', { name: theme, exact: true }).click()
      } else {
        await page
          .getByRole('button', { name: 'Open menu', exact: true })
          .click()
        await page
          .getByRole('button', { name: 'Toggle theme', exact: true })
          .click()
        await page.getByRole('button', { name: theme, exact: true }).click()
        await page
          .getByRole('button', { name: 'Close menu', exact: true })
          .click()
        await page.getByRole('dialog').waitFor({ state: 'hidden' })
        await page
          .getByRole('button', { name: 'Search products', exact: true })
          .click()
      }
      const request = page.waitForRequest(
        (r) =>
          r.method() === 'POST' &&
          r.url().includes('/multi-search') &&
          r.postData()?.includes('software'),
        { timeout: 20000 },
      )
      await page.getByRole('searchbox').fill('software')
      await request
      await pending
      const status = page
        .getByRole('status')
        .filter({ hasText: /Loading search results|Searching products/ })
      await status.waitFor()
      const box = await status.boundingBox()
      if (
        box.height < 240 ||
        (await status.getByText('Searching products…', { exact: true }).count())
      )
        throw new Error(
          `${theme}/${width}: expected result-shaped skeleton rows instead of loading text`,
        )
      if ((await status.getAttribute('aria-busy')) !== 'true')
        throw new Error('Skeleton must expose its loading state')
      await page.screenshot({
        path: `.playwright-mcp/search-loading-${theme.toLowerCase()}-${width}.png`,
      })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      if (
        await status.evaluate((e) =>
          e
            .getAnimations({ subtree: true })
            .some((a) => a.playState === 'running'),
        )
      )
        throw new Error('Skeleton animation must respect reduced motion')
    } finally {
      release()
      if (held) await finished
      await page.unroute('**/multi-search*', handler)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
    }
    await page
      .getByRole('link', { name: /Data Recovery Software/ })
      .first()
      .waitFor()
  }
  return 'Search skeletons render in both themes on desktop/mobile, respect reduced motion, and resolve to real results.'
}
