/* global MutationObserver, document, window */
import { chromium, expect } from '@playwright/test'

const baseUrl = process.env.PHASE3_DEV_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
const unexpectedContextLosses = []

page.on('console', (message) => {
  if (message.text().includes('Context Lost')) {
    unexpectedContextLosses.push(message.text())
  }
})

await page.addInitScript(() => {
  window.__phase3MaxCanvasCount = 0
  const recordCanvasCount = () => {
    window.__phase3MaxCanvasCount = Math.max(
      window.__phase3MaxCanvasCount,
      document.querySelectorAll('canvas').length,
    )
  }
  new MutationObserver(recordCanvasCount).observe(document, {
    childList: true,
    subtree: true,
  })
  window.addEventListener('DOMContentLoaded', recordCanvasCount)
})

try {
  const devTools = await context.newCDPSession(page)
  await devTools.send('Network.enable')
  await devTools.send('Network.setCacheDisabled', { cacheDisabled: true })

  const refreshes = []
  for (let cycle = 1; cycle <= 5; cycle += 1) {
    if (cycle === 1) {
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    } else {
      await page.reload({ waitUntil: 'domcontentloaded' })
    }

    const slot = page.locator('.hero-scene-slot')
    await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
    await expect(page.locator('canvas')).toHaveCount(1)

    // R3F 9.7.0 schedules renderer disposal 500 ms after StrictMode cleanup.
    await page.waitForTimeout(1_250)
    await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
    await expect(page.locator('canvas')).toHaveCount(1)

    const maximumCanvasCount = await page.evaluate(
      () => window.__phase3MaxCanvasCount,
    )
    expect(maximumCanvasCount).toBe(1)
    refreshes.push({ cycle, canvasCount: 1, maximumCanvasCount })
  }

  expect(unexpectedContextLosses).toEqual([])

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-pointer-enabled', 'true')
  await expect.poll(
    async () => Number(await slot.getAttribute('data-scene-arrival')),
  ).toBeGreaterThan(0.98)
  await expect.poll(
    async () => Number(await slot.getAttribute('data-scene-operational')),
  ).toBeGreaterThan(0.98)

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
  await expect.poll(
    async () => Number(await slot.getAttribute('data-scene-pointer-x')),
  ).toBeGreaterThan(0.65)

  await page.mouse.move(5, 5)
  await expect(slot).toHaveAttribute('data-scene-pointer-active', 'false')
  await expect.poll(
    async () => Math.abs(Number(await slot.getAttribute('data-scene-near-x'))),
  ).toBeLessThan(0.012)

  await page.evaluate(() => window.scrollTo(0, Math.min(420, window.innerHeight * 0.48)))
  await expect.poll(
    async () => Number(await slot.getAttribute('data-scene-recession')),
  ).toBeGreaterThan(0.25)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(
    async () => Number(await slot.getAttribute('data-scene-recession')),
  ).toBeLessThan(0.01)

  await page.locator('canvas').evaluate((canvas) => {
    const renderingContext = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    const contextLoss = renderingContext?.getExtension('WEBGL_lose_context')
    if (!contextLoss) throw new Error('WEBGL_lose_context is unavailable.')
    contextLoss.loseContext()
  })
  await expect(slot).toHaveAttribute('data-scene-mode', 'fallback')
  await expect(slot).toHaveAttribute('data-scene-reason', 'context-lost')
  await expect(page.locator('canvas')).toHaveCount(0)

  console.info('Phase 3 dev lifecycle check', {
    refreshes,
    pointer: 'active and returned to neutral',
    idle: 'active',
    recession: 'forward and reverse',
    simulatedContextLoss: 'fallback',
  })
} finally {
  await browser.close()
}
