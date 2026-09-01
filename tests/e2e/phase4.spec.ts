import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function scrollToProgress(page: Page, progress: number) {
  await page.evaluate((targetProgress) => {
    const story = document.querySelector<HTMLElement>('.hero-planify-story')
    const distance = Number(story?.dataset.transitionDistance ?? window.innerHeight)
    window.scrollTo(0, distance * targetProgress)
  }, progress)
}

test('Planify is a semantic flagship story using the approved product image', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  const flagship = page.locator('#work')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(story).toHaveAttribute('data-transition-trigger-count', '1')
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect(flagship.getByText('Flagship Software Project', { exact: true })).toBeVisible()
  await expect(flagship.getByRole('heading', { name: 'Planify.al' })).toBeVisible()
  await expect(
    flagship.getByText('Planify is my flagship software project.', { exact: true }),
  ).toBeVisible()
  await expect(
    flagship.getByText(
      'This is where the Developer Universe becomes real software—a product I’ve designed, built, and developed across the stack.',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(flagship).not.toContainText('Planify is Franci’s flagship software project.')
  await expect(flagship).not.toContainText('Approved screenshot')
  await expect(
    flagship.getByRole('heading', { name: 'Built as a complete product.' }),
  ).toBeVisible()
  await expect(
    flagship.getByText(
      'Planify brings customer booking, staff workflows, and business operations together in one connected experience.',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(flagship).not.toContainText('semantic browser frame')
  await expect(flagship).not.toContainText('settles nearly flat')
  await expect(flagship).not.toContainText('for review')
  await expect(flagship.getByRole('img', { name: 'Planify dashboard preview' })).toHaveAttribute(
    'src',
    '/planify-preview.png',
  )
  await expect(flagship.getByRole('link', { name: /View Planify/ })).toHaveAttribute(
    'href',
    'https://planify.al',
  )
  await expect(flagship.locator('.flagship-system-path li')).toHaveCount(4)
})

test('one bounded progress coordinates convergence, focus, handoff, ownership, and reverse scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  const slot = page.locator('.hero-scene-slot')
  const handoff = page.locator('[data-planify-handoff-frame]')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(story).toHaveAttribute('data-transition-progress', '0.0000')

  await scrollToProgress(page, 0.24)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.2)
  await expect(story).toHaveAttribute('data-transition-phase', 'convergence')
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-convergence'))).toBeGreaterThan(0.35)
  const supportingDepth = Number(await slot.getAttribute('data-scene-supporting-depth'))

  await scrollToProgress(page, 0.58)
  await expect(story).toHaveAttribute('data-transition-phase', 'monitor-focus')
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-monitor-focus'))).toBeGreaterThan(0.45)
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-supporting-depth'))).toBeGreaterThan(supportingDepth)
  await expect.poll(async () => Number(await slot.getAttribute('data-transition-source-release'))).toBeGreaterThan(0.7)
  const pickupOpacity = await page.evaluate(() => ({
    scene: Number.parseFloat(getComputedStyle(document.querySelector('.hero-scene-layer')!).opacity),
    transfer: Number.parseFloat(getComputedStyle(document.querySelector('[data-planify-handoff-frame]')!).opacity),
  }))
  expect(pickupOpacity.scene + pickupOpacity.transfer).toBeCloseTo(1, 1)

  await scrollToProgress(page, 0.76)
  await expect(story).toHaveAttribute('data-transition-phase', 'visual-handoff')
  await expect.poll(async () => Number(await slot.getAttribute('data-transition-handoff'))).toBeGreaterThan(0.65)
  await expect(handoff).toBeVisible()
  const flyingFrame = await handoff.boundingBox()
  expect(flyingFrame?.width ?? 0).toBeGreaterThan(450)

  await scrollToProgress(page, 0.84)
  await expect.poll(async () => Number(await slot.getAttribute('data-transition-handoff'))).toBeGreaterThan(0.99)
  const transferredFrame = await handoff.boundingBox()
  const targetFrame = await page.locator('[data-planify-target-screen]').boundingBox()
  expect(Math.abs((transferredFrame?.x ?? 0) - (targetFrame?.x ?? 0))).toBeLessThan(1.5)
  expect(Math.abs((transferredFrame?.y ?? 0) - (targetFrame?.y ?? 0))).toBeLessThan(1.5)
  expect(Math.abs((transferredFrame?.width ?? 0) - (targetFrame?.width ?? 0))).toBeLessThan(1.5)
  expect(Math.abs((transferredFrame?.height ?? 0) - (targetFrame?.height ?? 0))).toBeLessThan(1.5)
  const dockingOpacity = await page.evaluate(() => ({
    transfer: Number.parseFloat(getComputedStyle(document.querySelector('[data-planify-handoff-frame]')!).opacity),
    target: Number.parseFloat(getComputedStyle(document.querySelector('[data-planify-target-screen] img')!).opacity),
    intro: Number.parseFloat(getComputedStyle(document.querySelector('.flagship-section__intro')!).opacity),
  }))
  expect(dockingOpacity.transfer + dockingOpacity.target).toBeCloseTo(1, 1)
  expect(dockingOpacity.intro).toBeLessThan(0.05)

  await scrollToProgress(page, 1)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.97)
  await expect(story).toHaveAttribute('data-transition-phase', 'dom-ownership')
  await expect.poll(async () => Number(await slot.getAttribute('data-transition-dom-ownership'))).toBeGreaterThan(0.98)
  await expect(page.locator('[data-planify-browser]')).toBeVisible()
  await expect(slot).toHaveAttribute('data-scene-active', 'false')
  await expect(page.locator('.flagship-section__intro')).toHaveCSS('opacity', '1')

  await scrollToProgress(page, 0.84)
  await expect(story).toHaveAttribute('data-transition-direction', 'reverse')
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeLessThan(0.85)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.83)
  const reverseTransferredFrame = await handoff.boundingBox()
  const reverseTargetFrame = await page.locator('[data-planify-target-screen]').boundingBox()
  expect(Math.abs((reverseTransferredFrame?.x ?? 0) - (reverseTargetFrame?.x ?? 0))).toBeLessThan(1.5)
  expect(Math.abs((reverseTransferredFrame?.y ?? 0) - (reverseTargetFrame?.y ?? 0))).toBeLessThan(1.5)

  await scrollToProgress(page, 0.28)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeLessThan(0.32)
  await expect(story).toHaveAttribute('data-transition-direction', 'reverse')
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-monitor-focus'))).toBeLessThan(0.45)

  await scrollToProgress(page, 0)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeLessThan(0.01)
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('normal and faster scroll preserve a single synchronized owner in both directions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  const slot = page.locator('.hero-scene-slot')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')

  await scrollToProgress(page, 0.18)
  await scrollToProgress(page, 0.94)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.9)
  await expect.poll(async () => Number(await slot.getAttribute('data-transition-dom-ownership'))).toBeGreaterThan(0.98)
  await expect(page.locator('[data-planify-browser]')).toBeVisible()

  await scrollToProgress(page, 0.24)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeLessThan(0.3)
  await expect(story).toHaveAttribute('data-transition-direction', 'reverse')
  await expect.poll(async () => Number(await slot.getAttribute('data-transition-source-release'))).toBeLessThan(0.01)
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('resize refreshes measured geometry without duplicating the transition controller', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  const firstRefreshCount = Number(await story.getAttribute('data-transition-refresh-count'))
  const firstGeometry = await story.getAttribute('data-transition-geometry')

  await page.setViewportSize({ width: 1280, height: 720 })
  await expect.poll(async () => Number(await story.getAttribute('data-transition-refresh-count'))).toBeGreaterThan(firstRefreshCount)
  await expect.poll(async () => story.getAttribute('data-transition-geometry')).not.toBe(firstGeometry)
  await expect(story).toHaveAttribute('data-transition-trigger-count', '1')
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('reduced motion bypasses scrub while leaving the complete Planify case study readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(story).toHaveAttribute('data-transition-mode', 'reduced')
  await expect(story).toHaveAttribute('data-transition-bypassed', 'true')
  await expect(story).not.toHaveAttribute('data-transition-trigger-count', '1')
  await expect(page.locator('canvas')).toHaveCount(0)

  await page.locator('#work').scrollIntoViewIfNeeded()
  await expect(page.locator('#work')).toBeVisible()
  await expect(page.locator('[data-planify-browser]')).toBeVisible()
  await expect(page.locator('[data-planify-handoff-frame]')).toBeHidden()
  await expect(page.locator('#work').getByRole('link', { name: /View Planify/ })).toBeVisible()
})

test('coarse-pointer mobile uses the simplified path without horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(story).toHaveAttribute('data-transition-mode', 'simplified')
  await expect(page.locator('[data-planify-handoff-frame]')).toBeHidden()

  await page.locator('#work').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-planify-browser]')).toBeVisible()
  await expect(page.locator('#work').getByRole('heading', { name: 'Planify.al' })).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)

  await context.close()
})

test('anchor navigation and an in-transition refresh restore a valid synchronized state', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await page.getByRole('link', { name: 'Explore My Work' }).click()
  await expect(page).toHaveURL(/#work$/)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.97)
  await expect(page.locator('[data-planify-browser]')).toBeVisible()

  await page.evaluate(() => {
    history.replaceState(null, '', '/')
    const story = document.querySelector<HTMLElement>('.hero-planify-story')
    const distance = Number(story?.dataset.transitionDistance ?? window.innerHeight)
    window.scrollTo(0, distance * 0.56)
  })
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.5)
  await page.reload()
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  const restoredProgress = Number(await story.getAttribute('data-transition-progress'))
  expect(restoredProgress).toBeGreaterThanOrEqual(0)
  expect(restoredProgress).toBeLessThanOrEqual(1)
  await expect(story).toHaveAttribute('data-transition-trigger-count', '1')
})

test('a cold #work deep link restores Planify after the React tree mounts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#work')

  const story = page.locator('.hero-planify-story')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(page.locator('#work').getByRole('heading', { name: 'Planify.al' })).toBeInViewport()
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.97)
  await expect(page.locator('[data-planify-browser]')).toBeVisible()
})

test('the no-WebGL fallback still completes the same DOM handoff', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', {
      configurable: true,
      value: undefined,
    })
  })
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-reason', 'webgl-unavailable')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(story).toHaveAttribute('data-transition-module', 'ready')

  await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>('.hero-planify-story')
    const distance = Number(story?.dataset.transitionDistance ?? window.innerHeight)
    window.scrollTo(0, distance)
  })
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeGreaterThan(0.97)
  await expect(page.locator('[data-planify-browser]')).toBeVisible()
  await expect(page.locator('#work').getByRole('link', { name: /View Planify/ })).toBeVisible()
})

for (const viewport of [
  { name: 'minimum phone', width: 320, height: 568 },
  { name: 'compact desktop', width: 1024, height: 768 },
  { name: 'ultrawide desktop', width: 1920, height: 1080 },
]) {
  test(`keeps the Planify story usable at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/#work')

    const story = page.locator('.hero-planify-story')
    const work = page.locator('#work')
    await expect(story).toHaveAttribute('data-transition-module', 'ready')
    await expect(work.getByRole('heading', { name: 'Planify.al' })).toBeInViewport()
    await expect(work.getByRole('link', { name: /View Planify/ })).toBeVisible()
    await expect(work.getByRole('img', { name: 'Planify dashboard preview' })).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
  })
}
