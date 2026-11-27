// Background transparency must preserve opaque text and readable contrast.
async function auditSurfaces(page) {
  await page.setViewportSize({ width: 1318, height: 728 })
  await page.goto('https://web.thrift-commerce.workers.dev', {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForFunction(() => document.querySelector('video')?.autoplay)
  const failures = []
  for (const theme of ['Light', 'Dark']) {
    await page
      .getByRole('button', { name: 'Toggle theme', exact: true })
      .click()
    await page.getByRole('menuitem', { name: theme, exact: true }).click()
    await page.getByRole('searchbox').fill('dress')
    await page.getByRole('searchbox').click()
    const close = page.getByRole('button', { name: 'Close search results' })
    await close.waitFor()
    const targets = [
      ['navigation', page.getByRole('navigation')],
      [
        'search field',
        page.getByRole('searchbox').locator('xpath=ancestor::span[1]'),
      ],
      ['results', close.locator('..')],
      ['video control', page.getByRole('button', { name: /background video/ })],
      ['Browse', page.getByRole('link', { name: 'Browse', exact: true })],
      [
        'Start selling',
        page.getByRole('link', { name: 'Start selling', exact: true }),
      ],
    ]
    for (const [name, target] of targets) {
      const result = await target.evaluate((element) => {
        const style = getComputedStyle(element)
        const pseudo = getComputedStyle(element, '::before')
        const surface =
          element.tagName === 'NAV' &&
          pseudo.content !== 'none' &&
          pseudo.content !== 'normal'
            ? pseudo
            : style
        const bounds = element.getBoundingClientRect()
        let clippedBackdrop = false
        for (
          let parent = element.parentElement;
          parent;
          parent = parent.parentElement
        ) {
          const parentStyle = getComputedStyle(parent),
            box = parent.getBoundingClientRect()
          if (
            parentStyle.backdropFilter !== 'none' &&
            (bounds.left < box.left ||
              bounds.right > box.right ||
              bounds.top < box.top ||
              bounds.bottom > box.bottom)
          )
            clippedBackdrop = true
        }
        const ctx = document.createElement('canvas').getContext('2d')
        const rgba = (color) => {
          ctx.clearRect(0, 0, 1, 1)
          ctx.fillStyle = color
          ctx.fillRect(0, 0, 1, 1)
          return [...ctx.getImageData(0, 0, 1, 1).data]
        }
        const background = rgba(surface.backgroundColor),
          text = rgba(style.color)
        const luminance = (rgb) =>
          rgb
            .slice(0, 3)
            .map((v) => v / 255)
            .map((v) =>
              v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
            )
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
        const fg = luminance(text),
          alpha = background[3] / 255
        const ratios = [0, 255].map((backdrop) => {
          const bg = luminance(
            background.map((c) => c * alpha + backdrop * (1 - alpha)),
          )
          return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
        })
        return {
          alpha,
          minContrast: Math.min(...ratios),
          opacity: style.opacity,
          blur: surface.backdropFilter,
          clippedBackdrop,
        }
      })
      if (
        !(
          result.alpha >= 0.74 &&
          result.alpha <= (name === 'Browse' ? 0.91 : 0.81) &&
          result.minContrast >= 4.5 &&
          result.opacity === '1' &&
          result.blur.includes('blur') &&
          !result.clippedBackdrop
        )
      )
        failures.push(`${theme} ${name}: ${JSON.stringify(result)}`)
    }
    await page.keyboard.press('Escape')
  }
  if (failures.length) throw new Error(failures.join('\n'))
  return 'Both themes use translucent, blurred backgrounds with opaque text and at least 4.5:1 contrast over black or white.'
}
