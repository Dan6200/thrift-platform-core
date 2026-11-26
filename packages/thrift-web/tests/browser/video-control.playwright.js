async function auditVideoControlTheme(page) {
  await page.setViewportSize({ width: 1318, height: 728 })
  await page.goto('https://web.thrift-commerce.workers.dev', {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForFunction(() => document.querySelector('video')?.autoplay)
  for (const theme of ['Light', 'Dark']) {
    await page
      .getByRole('button', { name: 'Toggle theme', exact: true })
      .click()
    await page.getByRole('menuitem', { name: theme, exact: true }).click()
    const colors = await page
      .getByRole('button', { name: /background video/ })
      .evaluate((button) => {
        const style = getComputedStyle(button)
        const nav = getComputedStyle(document.querySelector('nav'))
        return {
          background: style.backgroundColor,
          color: style.color,
          expectedBackground: nav.backgroundColor,
          expectedColor: nav.color,
        }
      })
    if (
      colors.background !== colors.expectedBackground ||
      colors.color !== colors.expectedColor
    )
      throw new Error(
        `${theme}: video control does not follow the theme: ${JSON.stringify(colors)}`,
      )
  }
  return 'Video control follows the light and dark theme surfaces and text colors.'
}
