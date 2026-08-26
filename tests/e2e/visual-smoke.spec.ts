import { expect, test } from '@playwright/test'

test('captures the desktop foundation for visual review', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(page.getByRole('link', { name: 'Skip to content' })).not.toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('phase3-desktop-hero.png') })
  await page.locator('#work').screenshot({
    path: testInfo.outputPath('desktop-flagship.png'),
  })
  await expect(page.getByRole('link', { name: 'Skip to content' })).not.toBeInViewport()
  await page.locator('#stack').screenshot({
    path: testInfo.outputPath('desktop-stack.png'),
  })
})

test('captures the short-laptop hero with all actions in view', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(page.getByRole('button', { name: 'Ask My AI' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('phase3-short-laptop-hero.png') })
})

test('captures the mobile reduced scene', async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-tier', 'reduced')
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-mode', 'enhanced')
  await page.screenshot({ path: testInfo.outputPath('phase3-mobile-hero-top.png') })
  await page.locator('#top').screenshot({
    path: testInfo.outputPath('phase3-mobile-complete-hero.png'),
  })
  await context.close()
})

test('captures the mobile reduced-motion fallback', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-tier', 'static')
  await page.screenshot({ path: testInfo.outputPath('phase3-reduced-motion-top.png') })
  await page.locator('#top').screenshot({
    path: testInfo.outputPath('phase3-reduced-motion-complete-hero.png'),
  })
})

test('captures the no-WebGL fallback', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', {
      configurable: true,
      value: undefined,
    })
  })
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.hero-scene-slot')).toHaveAttribute(
    'data-scene-reason',
    'webgl-unavailable',
  )
  await page.screenshot({ path: testInfo.outputPath('phase3-no-webgl-fallback.png') })
})

test('captures the mobile foundation and open navigation for visual review', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await page.locator('.menu-toggle').click()
  await expect(page.locator('#mobile-navigation')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('mobile-menu.png') })
  await page.keyboard.press('Escape')
  await page.locator('#stack').scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('mobile-stack.png') })
})
