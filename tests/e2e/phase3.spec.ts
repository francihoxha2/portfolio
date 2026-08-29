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
  // Cross R3F's deferred cleanup window before accepting the live renderer.
  await page.waitForTimeout(1_250)
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(page.locator('canvas')).toHaveCount(1)

  const diagnostics = await slot.evaluate((element) => ({
    tier: element.getAttribute('data-scene-tier'),
    drawCalls: Number(element.getAttribute('data-scene-draw-calls')),
    triangles: Number(element.getAttribute('data-scene-triangles')),
    lines: Number(element.getAttribute('data-scene-lines')),
    points: Number(element.getAttribute('data-scene-points')),
    textures: Number(element.getAttribute('data-scene-textures')),
    programs: Number(element.getAttribute('data-scene-programs')),
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
  await page.locator('canvas').evaluate((canvas) => {
    const drawingCanvas = canvas as HTMLCanvasElement
    const renderingContext = drawingCanvas.getContext('webgl2')
      ?? drawingCanvas.getContext('webgl')
    const contextLoss = renderingContext?.getExtension('WEBGL_lose_context')
    if (!contextLoss) throw new Error('WEBGL_lose_context is unavailable.')
    contextLoss.loseContext()
  })

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
    textures: Number(element.getAttribute('data-scene-textures')),
    programs: Number(element.getAttribute('data-scene-programs')),
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

test('Phase 3B exposes assembly, operational idle, and independent pointer layers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  const hero = page.locator('#top')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(hero).toHaveAttribute('data-hero-environment', 'online')
  await expect(page.locator('.hero-section__environment')).toHaveAttribute('aria-hidden', 'true')
  await expect(slot).toHaveAttribute('data-scene-pointer-enabled', 'true')
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-arrival'))).toBeGreaterThan(0.98)
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-operational'))).toBeGreaterThan(0.98)

  const firstIdleTick = Number(await slot.getAttribute('data-scene-idle-tick'))
  await page.waitForTimeout(350)
  const secondIdleTick = Number(await slot.getAttribute('data-scene-idle-tick'))
  expect(secondIdleTick).toBeGreaterThan(firstIdleTick)

  const heroBounds = await page.locator('#top').boundingBox()
  if (!heroBounds) throw new Error('Hero bounds were unavailable.')
  await page.mouse.move(
    heroBounds.x + heroBounds.width * 0.88,
    heroBounds.y + heroBounds.height * 0.28,
  )
  await expect(slot).toHaveAttribute('data-scene-pointer-active', 'true')
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-pointer-x'))).toBeGreaterThan(0.65)
  await expect.poll(async () => Number.parseFloat(await hero.evaluate(
    (element) => getComputedStyle(element).getPropertyValue('--hero-atmosphere-x'),
  ))).toBeGreaterThan(5)
  await page.waitForTimeout(650)

  const layers = await slot.evaluate((element) => [
    'primary',
    'near',
    'mid',
    'far',
    'data',
  ].map((layer) => Number(element.getAttribute(`data-scene-${layer}-x`))))
  expect(new Set(layers.map((value) => value.toFixed(3))).size).toBe(5)
  expect(Math.abs(layers[1])).toBeGreaterThan(Math.abs(layers[0]))
  expect(layers[2]).toBeLessThan(0)
  expect(layers[4]).toBeLessThan(layers[3])

  await page.mouse.move(5, 5)
  await expect(slot).toHaveAttribute('data-scene-pointer-active', 'false')
  await expect.poll(async () => Math.abs(Number(await slot.getAttribute('data-scene-near-x')))).toBeLessThan(0.012)
  await expect.poll(async () => Math.abs(Number.parseFloat(await hero.evaluate(
    (element) => getComputedStyle(element).getPropertyValue('--hero-atmosphere-x'),
  )))).toBeLessThan(0.1)
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('Phase 3B recession follows initial native scroll and reverses at the Hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  const hero = page.locator('#top')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(slot).toHaveAttribute('data-scene-recession', '0.0000')

  await page.evaluate(() => window.scrollTo(0, Math.min(420, window.innerHeight * 0.48)))
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-recession'))).toBeGreaterThan(0.25)
  await expect.poll(async () => Number.parseFloat(await hero.evaluate(
    (element) => getComputedStyle(element).getPropertyValue('--hero-copy-recession-y'),
  ))).toBeLessThan(-1)

  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-recession'))).toBeLessThan(0.01)
  await expect.poll(async () => Math.abs(Number.parseFloat(await hero.evaluate(
    (element) => getComputedStyle(element).getPropertyValue('--hero-copy-recession-y'),
  )))).toBeLessThan(0.1)
  await expect(page.locator('canvas')).toHaveCount(1)
})
