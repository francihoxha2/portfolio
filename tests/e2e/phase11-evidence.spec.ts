import { expect, test, type Browser, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Phase 11 cross-browser / cross-device acceptance evidence.
 *
 * Gated exactly like the Phase 3B, Phase 4, and Phase 10 evidence specs: it is
 * excluded from `npm run test:e2e` and produced on demand by
 * `npm run evidence:phase11` on a single worker.
 *
 * Deliberately lean. Each engine contributes one desktop still, and the
 * device/fallback conditions are captured once, in the Chrome project, because
 * a second copy of the same 390 px layout in three more engines is duplicate
 * material rather than additional proof.
 */

const evidenceRequested = process.env.PHASE11_EVIDENCE === '1'

test.skip(
  !evidenceRequested,
  'Run `npm run evidence:phase11` to create the Phase 11 acceptance evidence.',
)
test.describe.configure({ mode: 'serial' })

const artifactDirectory = resolve('artifacts/phase11')
const baseURL = 'http://127.0.0.1:4173'

async function shoot(page: Page, file: string, fullPage = false) {
  await mkdir(artifactDirectory, { recursive: true })
  await page.screenshot({ path: resolve(artifactDirectory, file), fullPage, animations: 'disabled' })
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(700)
}

async function openContext(
  browser: Browser,
  viewport: { width: number; height: number },
  options: { touch?: boolean; reducedMotion?: 'reduce' | 'no-preference' } = {},
) {
  const context = await browser.newContext({
    baseURL,
    colorScheme: 'dark',
    viewport,
    hasTouch: options.touch ?? false,
    reducedMotion: options.reducedMotion ?? 'no-preference',
  })
  return { context, page: await context.newPage() }
}

/** One desktop still per engine - this is the cross-browser parity record. */
test('captures the desktop engine still', async ({ browser }, testInfo) => {
  const engine = testInfo.project.name
  const { context, page } = await openContext(browser, { width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
  await settle(page)

  const slot = page.locator('.hero-scene-slot')
  const tier = await slot.getAttribute('data-scene-tier')
  const reason = await slot.getAttribute('data-scene-reason')
  const canvases = await page.locator('canvas').count()
  testInfo.annotations.push({
    type: 'scene',
    description: `${engine}: tier=${tier} reason=${reason} canvases=${canvases}`,
  })

  await shoot(page, `desktop-${engine}.png`)
  await context.close()
})

// The remaining conditions are engine-independent by construction, so they are
// captured once rather than four times.
test.describe('device and fallback conditions', () => {
  // Playwright requires the first `beforeEach` argument to be an object
  // destructuring pattern, and ESLint rejects an empty one, so the guard reads
  // the project from `test.info()` inside each test instead.
  const chromeProjectOnly = () =>
    test.skip(
      test.info().project.name !== 'chrome',
      'Captured once in the Chrome project to avoid duplicate evidence.',
    )

  test('captures the 390 px mobile layout', async ({ browser }) => {
    chromeProjectOnly()
    const { context, page } = await openContext(browser, { width: 390, height: 844 }, { touch: true })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await settle(page)
    await shoot(page, 'mobile-390.png')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await settle(page)
    await shoot(page, 'mobile-390-contact.png')
    await context.close()
  })

  test('captures the short landscape layout', async ({ browser }) => {
    chromeProjectOnly()
    const { context, page } = await openContext(browser, { width: 740, height: 360 }, { touch: true })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await settle(page)
    await shoot(page, 'short-landscape-740x360.png')
    await context.close()
  })

  test('captures the reduced-motion presentation', async ({ browser }) => {
    chromeProjectOnly()
    const { context, page } = await openContext(
      browser,
      { width: 1280, height: 720 },
      { reducedMotion: 'reduce' },
    )
    await page.goto('/')
    await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-tier', 'static')
    await settle(page)
    await shoot(page, 'reduced-motion.png')
    await context.close()
  })

  test('captures the AI error and recovery affordance', async ({ browser }) => {
    chromeProjectOnly()
    const { context, page } = await openContext(browser, { width: 1280, height: 720 })
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'mocked provider failure' }),
      }),
    )
    await page.goto('/')
    await page.locator('#ai').scrollIntoViewIfNeeded()
    const section = page.locator('#ai')
    await section.getByLabel('Ask the portfolio assistant').fill('Evidence question')
    await section.getByLabel('Ask the portfolio assistant').press('Enter')
    await expect(section.getByRole('alert')).toContainText('temporarily unavailable')
    await expect(section.getByRole('button', { name: 'Retry' })).toBeVisible()
    await settle(page)
    await section.screenshot({ path: resolve(artifactDirectory, 'ai-provider-error.png') })
    await context.close()
  })

  test('captures the WebGL-unavailable fallback', async ({ browser }) => {
    chromeProjectOnly()
    const { context, page } = await openContext(browser, { width: 1280, height: 720 })
    await page.addInitScript(() => {
      Object.defineProperty(window, 'WebGLRenderingContext', { configurable: true, value: undefined })
    })
    await page.goto('/')
    await expect(page.locator('.hero-scene-slot')).toHaveAttribute(
      'data-scene-reason',
      'webgl-unavailable',
    )
    await settle(page)
    await shoot(page, 'webgl-unavailable.png')
    await context.close()
  })

  test('captures the context-loss fallback', async ({ browser }) => {
    chromeProjectOnly()
    const { context, page } = await openContext(browser, { width: 1280, height: 720 })
    await page.goto('/')
    const slot = page.locator('.hero-scene-slot')
    await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced', { timeout: 15_000 })
    await page.locator('canvas').evaluate((canvas) => {
      const element = canvas as HTMLCanvasElement
      const gl = element.getContext('webgl2') ?? element.getContext('webgl')
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    })
    await expect(slot).toHaveAttribute('data-scene-reason', 'context-lost')
    await settle(page)
    await shoot(page, 'webgl-context-lost.png')
    await context.close()
  })
})
