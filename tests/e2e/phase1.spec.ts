import { expect, test, type Page } from '@playwright/test'

const sectionIds = [
  'top',
  'work',
  'stack',
  'selected-work',
  'journey',
  'credentials',
  'ai',
  'contact',
]

const viewports = [
  { name: 'minimum phone', width: 320, height: 568 },
  { name: 'small phone', width: 360, height: 640 },
  { name: 'phone', width: 375, height: 667 },
  { name: 'tall phone', width: 390, height: 844 },
  { name: 'large phone', width: 430, height: 932 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'tablet landscape', width: 1024, height: 768 },
  { name: 'short laptop', width: 1280, height: 720 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large desktop', width: 1920, height: 1080 },
]

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

test('semantic section order, identity, anchors, and skip link are correct', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const renderedOrder = await page.locator('main > section').evaluateAll((sections) =>
    sections.map((section) => section.id),
  )
  expect(renderedOrder).toEqual(sectionIds)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText(
    'Building modern software experiences, from idea to production.',
  )
  await expect(page.getByText('Web • Mobile • Backend • AI', { exact: true })).toBeVisible()
  await expect(
    page.locator('[data-testid="engineering-desktop-map"] [data-capability-id="java"] button'),
  ).toContainText('Java')
  expect(await page.locator('canvas').count()).toBeLessThanOrEqual(1)

  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeFocused()
  await skipLink.click()
  await expect(page.locator('main')).toBeFocused()
  await page.getByRole('link', { name: 'Explore My Work' }).click()
  await expect(page).toHaveURL(/#work$/)
  await expect(page.locator('#work')).toBeInViewport()
  expect(await page.locator('.site-brand').getAttribute('href')).toBe('#top')
})

for (const viewport of [
  { name: 'short laptop', width: 1280, height: 720 },
  { name: 'standard desktop', width: 1440, height: 900 },
]) {
  test(`keeps hero actions in the first view at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    for (const name of ['Explore My Work', 'Ask My AI', 'Download CV']) {
      const action = page.locator('.hero-section__actions').getByText(name, { exact: true })
      const box = await action.boundingBox()
      expect(box).not.toBeNull()
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height)
    }
  })
}

test('desktop navigation anchors clear the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const headerHeight = await page.locator('.site-header').evaluate((header) =>
    header.getBoundingClientRect().height,
  )

  for (const id of ['work', 'stack', 'journey', 'credentials', 'ai', 'contact']) {
    await page.locator('.site-nav--desktop').getByRole('link', {
      name: id === 'ai' ? 'Ask AI' : new RegExp(`^${id}`, 'i'),
    }).click()
    await page.waitForTimeout(500)
    const box = await page.locator(`#${id}`).boundingBox()
    expect(box).not.toBeNull()
    expect(box?.y ?? 0).toBeGreaterThanOrEqual(headerHeight - 1)
  }
})

test('mobile menu supports focus, outside close, and Escape focus return', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const toggle = page.locator('.menu-toggle')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#mobile-navigation')).toBeVisible()
  await expect(page.locator('#mobile-navigation').getByRole('link', { name: 'Work' })).toBeFocused()

  await page.locator('main').click({ position: { x: 8, y: 200 } })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')

  await toggle.click()
  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
})

test('mobile navigation closes after selection and does not retain stale breakpoint state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const toggle = page.locator('.menu-toggle')
  const mobileNavigation = page.locator('#mobile-navigation')
  await toggle.click()
  await mobileNavigation.getByRole('link', { name: 'Stack' }).click()
  await expect(page).toHaveURL(/#stack$/)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(mobileNavigation).toBeHidden()

  const headerHeight = await page.locator('.site-header').evaluate((header) =>
    header.getBoundingClientRect().height,
  )
  const stackBox = await page.locator('#stack').boundingBox()
  expect(stackBox?.y ?? 0).toBeGreaterThanOrEqual(headerHeight - 1)

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.setViewportSize({ width: 1100, height: 700 })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(mobileNavigation).toBeHidden()
})

for (const viewport of viewports) {
  test(`has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await expectNoHorizontalOverflow(page)
  })
}

/**
 * Phase 10 methodology correction. This previously set
 * `document.documentElement.style.zoom = '2'`, which scales layout boxes but
 * leaves media queries evaluating against the unzoomed viewport. At 1280x800
 * that kept the desktop header rendered inside a half-width layout and reported
 * a document overflow to 1421 px from `nav.site-nav` and its Download CV link -
 * an artifact of the technique, not a product defect. Real browser zoom halves
 * the CSS viewport and re-evaluates media queries, which is what this does.
 */
test('remains usable at 200% browser zoom', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 720, height: 450 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await page.locator('#work').scrollIntoViewIfNeeded()
  await expectNoHorizontalOverflow(page)

  await context.close()
})

test('core text tokens meet WCAG AA contrast', async ({ page }) => {
  await page.goto('/')

  const colors = await page.evaluate(() => {
    const body = getComputedStyle(document.body)
    const paragraph = getComputedStyle(document.querySelector('.hero-section__summary') as Element)
    return {
      background: body.backgroundColor,
      text: body.color,
      muted: paragraph.color,
    }
  })

  const luminance = (rgb: string) => {
    const values = rgb.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) ?? []
    const channels = values.map((value) => {
      const normalized = value / 255
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }
  const ratio = (foreground: string, background: string) => {
    const lighter = Math.max(luminance(foreground), luminance(background))
    const darker = Math.min(luminance(foreground), luminance(background))
    return (lighter + 0.05) / (darker + 0.05)
  }

  expect(ratio(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5)
  expect(ratio(colors.muted, colors.background)).toBeGreaterThanOrEqual(4.5)
})

test('loads only self-hosted fonts and stays within the font budget', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  const fontResources = await page.evaluate(() =>
    performance.getEntriesByType('resource')
      .filter((entry) => entry.name.endsWith('.woff2'))
      .map((entry) => {
        const resource = entry as PerformanceResourceTiming
        return {
          name: resource.name,
          bytes: resource.encodedBodySize,
        }
      }),
  )
  const transferredBytes = fontResources.reduce((total, font) => total + font.bytes, 0)

  expect(fontResources.some((font) => font.name.includes('geist-latin'))).toBe(true)
  expect(fontResources.some((font) => font.name.includes('space-grotesk-latin'))).toBe(true)
  expect(fontResources.every((font) => new URL(font.name).origin === 'http://127.0.0.1:4173')).toBe(true)
  expect(transferredBytes).toBeLessThanOrEqual(160 * 1024)
})
