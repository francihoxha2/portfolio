import { expect, test } from '@playwright/test'

test('lazy scene preserves the DOM hero before enhancing with one canvas', async ({ page }) => {
  let releaseScene: (() => void) | undefined
  const sceneHold = new Promise<void>((resolve) => {
    releaseScene = resolve
  })

  await page.route(/DeveloperUniverseCanvas(?:-[^/]+\.js|\.tsx)/, async (route) => {
    await sceneHold
    await route.continue()
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1')).toHaveText(
    'Building modern software experiences, from idea to production.',
  )
  await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask My AI' })).toBeVisible()
  await expect(page.locator('.hero-fallback')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)

  releaseScene?.()
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute(
    'data-scene-mode',
    'enhanced',
  )
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('reports renderer budgets and never mounts another canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(slot).toHaveAttribute('data-scene-draw-calls', /\d+/)

  const diagnostics = await slot.evaluate((element) => ({
    tier: element.getAttribute('data-scene-tier'),
    drawCalls: Number(element.getAttribute('data-scene-draw-calls')),
    triangles: Number(element.getAttribute('data-scene-triangles')),
    textures: Number(element.getAttribute('data-scene-textures')),
    dpr: Number(element.getAttribute('data-scene-dpr')),
  }))

  console.info('Phase 3 renderer diagnostics', diagnostics)

  expect(diagnostics.drawCalls).toBeLessThan(diagnostics.tier === 'full' ? 100 : 50)
  expect(diagnostics.triangles).toBeLessThan(
    diagnostics.tier === 'full' ? 150_000 : 50_000,
  )
  // Planify color texture plus the renderer's bounded shadow/internal targets.
  expect(diagnostics.textures).toBeLessThanOrEqual(4)
  expect(diagnostics.dpr).toBeLessThanOrEqual(diagnostics.tier === 'full' ? 1.75 : 1.25)

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(slot).toHaveAttribute('data-scene-active', 'false')

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(slot).toHaveAttribute('data-scene-active', 'true')

  await page.locator('#stack').scrollIntoViewIfNeeded()
  await expect(slot).toHaveAttribute('data-scene-active', 'false')
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('replaces a context-lost canvas with the accepted static fallback', async ({ page }) => {
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await page.locator('canvas').dispatchEvent('webglcontextlost')

  await expect(slot).toHaveAttribute('data-scene-mode', 'fallback')
  await expect(slot).toHaveAttribute('data-scene-reason', 'context-lost')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.hero-fallback')).toBeVisible()
})

test('uses the reduced scene on a coarse-pointer mobile context', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(slot).toHaveAttribute('data-scene-tier', 'reduced')
  await expect(slot).toHaveAttribute('data-scene-draw-calls', /\d+/)
  await expect(page.locator('canvas')).toHaveCount(1)

  const diagnostics = await slot.evaluate((element) => ({
    drawCalls: Number(element.getAttribute('data-scene-draw-calls')),
    triangles: Number(element.getAttribute('data-scene-triangles')),
    dpr: Number(element.getAttribute('data-scene-dpr')),
  }))
  console.info('Phase 3 reduced renderer diagnostics', diagnostics)
  expect(diagnostics.drawCalls).toBeLessThan(50)
  expect(diagnostics.triangles).toBeLessThan(50_000)
  expect(diagnostics.dpr).toBeLessThanOrEqual(1.25)

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)

  await context.close()
})

test('repeated reduced-motion changes never leave duplicate WebGL contexts', async ({ page }) => {
  await page.goto('/')
  const slot = page.locator('.hero-scene-slot')

  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(page.locator('canvas')).toHaveCount(1)

  for (let cycle = 0; cycle < 2; cycle += 1) {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(slot).toHaveAttribute('data-scene-reason', 'reduced-motion')
    await expect(page.locator('canvas')).toHaveCount(0)

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
    await expect(page.locator('canvas')).toHaveCount(1)
  }
})
