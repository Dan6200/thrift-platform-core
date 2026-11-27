async function auditGuestCart(page) {
  const context = await page
    .context()
    .browser()
    .newContext({ viewport: { width: 1318, height: 844 } })
  const tab = await context.newPage()
  try {
    await tab.goto('https://web.thrift-commerce.workers.dev/products/21', {
      waitUntil: 'networkidle',
    })
    await tab.getByRole('button', { name: 'Add To Cart' }).click()
    await tab.getByRole('button', { name: 'Add To Cart' }).waitFor()
    if (tab.url().includes('/auth/login'))
      throw new Error('Adding a guest item redirects to sign-in')
    await tab.goto('https://web.thrift-commerce.workers.dev/shopping-cart', {
      waitUntil: 'networkidle',
    })
    if (
      await tab
        .getByRole('heading', { name: 'Sign in to view your cart' })
        .count()
    )
      throw new Error('Guest cart is hidden behind sign-in')
    const row = tab.getByRole('article', { name: "Women's Summer Dress" })
    await row.waitFor()
    await row.getByRole('button', { name: 'Increase quantity' }).click()
    await row
      .getByRole('status', { name: 'Quantity' })
      .filter({ hasText: '2' })
      .waitFor()
    await tab.reload({ waitUntil: 'networkidle' })
    await row
      .getByRole('status', { name: 'Quantity' })
      .filter({ hasText: '2' })
      .waitFor()
    await row.getByRole('button', { name: 'Decrease quantity' }).click()
    await row
      .getByRole('status', { name: 'Quantity' })
      .filter({ hasText: '1' })
      .waitFor()
    await row.getByRole('button', { name: 'Remove item' }).click()
    await tab
      .getByRole('heading', { name: 'No Items in the Cart yet' })
      .waitFor()
    return 'Guest add/edit/remove and persistence work without authentication.'
  } finally {
    await context.close()
  }
}
