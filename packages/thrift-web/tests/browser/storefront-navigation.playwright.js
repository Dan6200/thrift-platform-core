async function auditStorefrontNavigation(page) {
  const context = await page.context().browser().newContext()
  const tab = await context.newPage()
  try {
    for (const path of [
      '/categories/electronics',
      '/subcategories/computers',
      '/subcategories/electronic-accessories',
      '/subcategories/mens-fashion',
      '/subcategories/womens-fashion',
    ]) {
      const response = await tab.goto(
        `https://web.thrift-commerce.workers.dev${path}`,
        { waitUntil: 'domcontentloaded' },
      )
      if (response.status() !== 200)
        throw new Error(`${path}: HTTP ${response.status()}`)
      await tab
        .getByRole('link')
        .filter({ has: tab.locator('img') })
        .first()
        .waitFor()
    }
    return 'All linked catalog sections render products.'
  } finally {
    await context.close()
  }
}
