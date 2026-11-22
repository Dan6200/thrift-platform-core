// Run with Playwright MCP browser_run_code_unsafe(filename). Uses the real site.
;async (page) => {
  const failures = []
  const check = (ok, message) => {
    if (!ok) failures.push(message)
  }
  for (const theme of ['light', 'dark']) {
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('https://web.thrift-commerce.workers.dev')
      await page.evaluate((theme) => {
        localStorage.setItem('theme', theme)
      }, theme)
      await page.reload()
      await page
        .getByRole('link', { name: 'Start selling', exact: true })
        .waitFor()
      const prefix = `${theme}/${width}`
      check(
        (await page
          .getByRole('heading', { level: 1, name: /Create lasting/ })
          .count()) === 1,
        `${prefix}: missing hero h1`,
      )
      check(
        (await page.locator('a button').count()) === 0,
        `${prefix}: nested interactive controls`,
      )
      for (const name of ['Browse', 'Start selling']) {
        const link = page.getByRole('link', { name, exact: true })
        const box = await link.boundingBox()
        check(
          box &&
            box.height >= 44 &&
            box.x >= 0 &&
            box.x + box.width <= width &&
            box.y + box.height <= 900,
          `${prefix}: ${name} target size/visibility`,
        )
        await link.focus()
        check(
          await link.evaluate((e) => e.matches(':focus-visible')),
          `${prefix}: ${name} keyboard focus`,
        )
      }
      check(
        (await page
          .getByRole('button', { name: /background video/ })
          .count()) === 1,
        `${prefix}: video pause control missing`,
      )
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${prefix}: horizontal overflow`,
      )
      if (width === 1440) {
        await page.getByRole('button', { name: 'Welcome', exact: true }).click()
        const opaque = await page
          .getByRole('link', { name: /Thrift Commerce/ })
          .evaluate((e) => {
            for (let p = e; p; p = p.parentElement) {
              const bg = getComputedStyle(p).backgroundColor
              if (bg !== 'rgba(0, 0, 0, 0)' && !bg.startsWith('rgba'))
                return true
            }
            return false
          })
        check(opaque, `${prefix}: menu has no opaque surface`)
        await page.keyboard.press('Escape')
      } else if (width === 390) {
        const open = page.getByRole('button', {
          name: 'Open menu',
          exact: true,
        })
        check(
          (await open.count()) === 1,
          `${prefix}: mobile menu lacks accessible name`,
        )
        if (await open.count()) {
          await open.click()
          await page.getByRole('dialog', { name: 'Navigation' }).waitFor()
          await page
            .getByRole('button', { name: 'Browse Categories', exact: true })
            .click()
          await page.keyboard.press('Escape')
          check(
            await open.evaluate((e) => e === document.activeElement),
            `${prefix}: menu focus not restored`,
          )
        }
      }
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  check(
    await page.locator('video').evaluate((e) => e.paused),
    'reduced motion: video autoplayed',
  )
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  if (failures.length) throw new Error(failures.join('\n'))
  return 'Hero browser audit passed in both themes at 390, 768 and 1440px, plus reduced motion.'
}
