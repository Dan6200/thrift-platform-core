async function auditAccountCart(page) {
  const context = await page.context().browser().newContext()
  const tab = await context.newPage()
  const writes = []
  tab.on('response', (response) => {
    if (
      response.url().includes('/v1/cart/items') &&
      ['POST', 'PUT', 'DELETE'].includes(response.request().method())
    )
      writes.push({
        method: response.request().method(),
        status: response.status(),
      })
  })
  try {
    await tab.goto('https://web.thrift-commerce.workers.dev/products/21', {
      waitUntil: 'networkidle',
    })
    await tab.getByRole('button', { name: 'Add To Cart' }).click()
    await tab.goto('https://web.thrift-commerce.workers.dev/shopping-cart', {
      waitUntil: 'networkidle',
    })
    let row = tab.getByRole('article', { name: "Women's Summer Dress" })
    await row.waitFor()
    await tab.goto(
      'https://web.thrift-commerce.workers.dev/auth/login?redirect=/shopping-cart',
      { waitUntil: 'networkidle' },
    )
    const method = await tab.locator('form').getAttribute('method')
    if (method !== 'post')
      throw new Error('Login form can submit credentials in a GET URL')
    await tab.evaluate(() => {
      const input = document.createElement('input')
      input.type = 'file'
      input.id = 'diagnostic-fixture'
      document.body.append(input)
    })
    await tab
      .locator('#diagnostic-fixture')
      .setInputFiles('/tmp/thrift-cart-fixture.json')
    const fixture = await tab.evaluate(async () =>
      JSON.parse(
        await document.querySelector('#diagnostic-fixture').files[0].text(),
      ),
    )
    await tab
      .locator('#diagnostic-fixture')
      .evaluate((element) => element.remove())
    await tab.getByLabel('Email', { exact: true }).fill(fixture.email)
    await tab.getByLabel('Password', { exact: true }).fill(fixture.password)
    await tab.getByRole('button', { name: 'Login', exact: true }).click()
    await tab.waitForURL('**/shopping-cart')
    row = tab.getByRole('article', { name: "Women's Summer Dress" })
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
    if (
      !writes.some((write) => write.method === 'POST' && write.status < 300) ||
      !writes.some((write) => write.method === 'PUT' && write.status < 300)
    )
      throw new Error('Cart writes did not reach the API')
    const cookieScopes = (await context.cookies())
      .filter((cookie) => cookie.name.startsWith('sb-'))
      .map((cookie) => ({ path: cookie.path, persistent: cookie.expires > 0 }))
    if (
      !cookieScopes.length ||
      cookieScopes.some((cookie) => cookie.path !== '/' || !cookie.persistent)
    )
      throw new Error('Session cookies lost their options')
    await row.getByRole('button', { name: 'Remove item' }).click()
    await tab
      .getByRole('heading', { name: 'No Items in the Cart yet' })
      .waitFor()
    return {
      writes,
      cookieScopes,
      result:
        'Guest cart transferred once, account edits persisted after reload, and removal reached the server.',
    }
  } finally {
    await context.close()
  }
}
