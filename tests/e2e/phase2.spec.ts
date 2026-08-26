import { expect, test, type Page } from '@playwright/test'

async function expectHeroFoundation(page: Page, fallbackOnly = false) {
  await expect(page.locator('h1')).toHaveText(
    'Building modern software experiences, from idea to production.',
  )
  await expect(page.getByText('Web • Mobile • Backend • AI', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask My AI' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Download CV' }).first()).toBeVisible()
  await expect(page.locator('.hero-fallback')).toBeVisible()
  if (fallbackOnly) await expect(page.locator('canvas')).toHaveCount(0)
}

test('keeps the DOM hero and static fallback intact without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', {
      configurable: true,
      value: undefined,
    })
  })
  await page.goto('/')

  await expectHeroFoundation(page, true)
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-tier', 'static')
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute(
    'data-scene-reason',
    'webgl-unavailable',
  )
})

test('selects the static contract before load for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  await expectHeroFoundation(page, true)
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-tier', 'static')
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute(
    'data-scene-reason',
    'reduced-motion',
  )
})

test('critical hero content remains ready while the fallback image is delayed', async ({ page }) => {
  let releaseImage: (() => void) | undefined
  const imageHold = new Promise<void>((resolve) => {
    releaseImage = resolve
  })

  await page.route('**/planify-preview.png', async (route) => {
    await imageHold
    await route.abort()
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask My AI' })).toBeVisible()
  await expect(page.locator('.hero-fallback')).toBeVisible()

  releaseImage?.()
})

test('hero actions follow the visual order and launch the assistant', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const actions = page.locator('.hero-section__actions').locator('a, button')
  await expect(actions).toHaveCount(3)
  await expect(actions.nth(0)).toHaveText('Explore My Work')
  await expect(actions.nth(1)).toHaveText('Ask My AI')
  await expect(actions.nth(2)).toHaveText('Download CV')
  await expect(actions.nth(2)).toHaveAttribute('href', '/Franci-Hoxha-CV.pdf')
  await expect(actions.nth(2)).toHaveAttribute('download', '')

  await actions.nth(1).click()
  await expect(page.getByRole('dialog', { name: 'AI Portfolio Assistant' })).toBeVisible()
  await expect(page.locator('.chat-panel .chat-input')).toBeFocused()
})

test('defers the floating AI launcher while the mobile hero actions are in view', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')

  await page.locator('.hero-section__actions').scrollIntoViewIfNeeded()
  await expect(page.locator('.chat-fab')).toHaveClass(/chat-fab--deferred/)
  await expect(page.getByRole('button', { name: 'Ask My AI' })).toBeInViewport()
})

for (const viewport of [
  { name: 'minimum phone', width: 320, height: 568 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'short laptop', width: 1280, height: 720 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large desktop', width: 1920, height: 1080 },
]) {
  test(`keeps the hero composition usable at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expectHeroFoundation(page)

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)

    if (viewport.width >= 1280) {
      const actionGroup = await page.locator('.hero-section__actions').boundingBox()
      expect(actionGroup).not.toBeNull()
      expect((actionGroup?.y ?? 0) + (actionGroup?.height ?? 0)).toBeLessThanOrEqual(
        viewport.height,
      )
    } else {
      const copy = await page.locator('.hero-section__content').boundingBox()
      const visual = await page.locator('.hero-scene-slot').boundingBox()
      expect(copy).not.toBeNull()
      expect(visual).not.toBeNull()
      expect(visual?.y ?? 0).toBeGreaterThanOrEqual((copy?.y ?? 0) + (copy?.height ?? 0))
    }
  })
}
