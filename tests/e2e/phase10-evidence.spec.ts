import { existsSync, readdirSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { expect, test, type Browser, type Page } from '@playwright/test'

/**
 * Phase 10 manual-acceptance evidence.
 *
 * Section 28.5 requires a real-browser recording for the global motion pass, so
 * this captures video of idle, pointer, scroll with direction reversal, and the
 * reduced-motion alternative, alongside the static states that screenshots
 * verify better than video.
 */

const recordingRequested = process.env.PHASE10_EVIDENCE === '1'

function hasPlaywrightFfmpeg() {
  const localAppData = process.env.LOCALAPPDATA
  if (!localAppData) return false
  const browserDirectory = join(localAppData, 'ms-playwright')
  if (!existsSync(browserDirectory)) return false

  try {
    return readdirSync(browserDirectory, { withFileTypes: true }).some((entry) => {
      if (!entry.isDirectory() || !entry.name.startsWith('ffmpeg-')) return false
      const executableDirectory = join(browserDirectory, entry.name)
      return [
        'ffmpeg-win64.exe',
        'ffmpeg-linux',
        'ffmpeg-mac',
      ].some((executable) => existsSync(join(executableDirectory, executable)))
    })
  } catch {
    return false
  }
}

// Gated like the Phase 3B and Phase 4 motion recordings: video encoding is
// CPU-heavy enough to starve the timing-sensitive functional specs sharing the
// worker pool, so the acceptance capture is requested explicitly.
test.skip(
  !recordingRequested,
  'Run `npm run evidence:phase10` to create the manual acceptance evidence.',
)
test.skip(
  recordingRequested && !hasPlaywrightFfmpeg(),
  'The Playwright FFmpeg binary is unavailable in this environment.',
)
test.describe.configure({ mode: 'serial' })

const artifactDirectory = resolve('artifacts/phase10')
const chromeless = '.site-header, .chat-widget, .skip-link { display: none !important; }'

// Each recording gets its own raw directory: Playwright moves the raw file on
// save, and workers running in parallel cannot share that directory on Windows.
const rawVideoDirectory = (name: string) => resolve(artifactDirectory, `.video-raw-${name}`)

async function saveRecording(page: Page, name: string, file: string) {
  const video = page.video()
  await page.context().close()
  if (video) await video.saveAs(resolve(artifactDirectory, file))
  await rm(rawVideoDirectory(name), { recursive: true, force: true })
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
}

async function fullPage(page: Page, file: string) {
  await page.screenshot({
    path: resolve(artifactDirectory, file),
    fullPage: true,
    animations: 'disabled',
  })
}

async function touchPage(browser: Browser, viewport: { width: number; height: number }) {
  const context = await browser.newContext({
    viewport,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  })
  const page = await context.newPage()
  await page.goto('/')
  await settle(page)
  return { context, page }
}

test.beforeAll(async () => {
  await mkdir(artifactDirectory, { recursive: true })
})

test('records the Phase 10 motion, pointer, and scroll acceptance pass', async ({ browser }) => {
  test.setTimeout(120_000)

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    recordVideo: { dir: rawVideoDirectory('desktop'), size: { width: 1440, height: 900 } },
  })
  const page = await context.newPage()
  await page.goto('/')
  await settle(page)

  // 1. Idle: the hero scene assembles and settles on its own.
  await page.waitForTimeout(2600)

  // 2. Pointer interaction on a fine-pointer device.
  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  for (const [x, y] of [[420, 300], [1080, 300], [1080, 640], [420, 640], [720, 450]]) {
    await page.mouse.move(x, y, { steps: 22 })
    await page.waitForTimeout(280)
  }
  await expect(slot).toHaveAttribute('data-scene-pointer-active', 'true')

  // 3. Scroll through the Hero -> Planify transition, then reverse direction.
  for (let step = 0; step < 14; step += 1) {
    await page.mouse.wheel(0, 90)
    await page.waitForTimeout(90)
  }
  await page.waitForTimeout(700)
  for (let step = 0; step < 14; step += 1) {
    await page.mouse.wheel(0, -90)
    await page.waitForTimeout(90)
  }
  await page.waitForTimeout(700)

  // 4. Continue through the full narrative at reading pace.
  for (const id of ['work', 'stack', 'selected-work', 'journey', 'credentials', 'ai', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(650)
  }

  // 5. Brand returns to the top and the scene re-engages.
  await page.getByRole('contentinfo').getByRole('link', { name: /back to the top/i }).click()
  await page.waitForTimeout(1800)
  await expect(slot).toHaveAttribute('data-scene-active', 'true')

  await saveRecording(page, 'desktop', '01-desktop-motion-pointer-scroll.webm')
})

test('records the reduced-motion alternative', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    recordVideo: { dir: rawVideoDirectory('reduced'), size: { width: 1440, height: 900 } },
  })
  const page = await context.newPage()
  await page.goto('/')
  await settle(page)
  await page.waitForTimeout(1200)

  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-mode', 'fallback')
  for (const id of ['work', 'stack', 'selected-work', 'journey', 'credentials', 'ai', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
  }

  await saveRecording(page, 'reduced', '02-reduced-motion-pass.webm')
})

test('records the mobile full-page pass', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
    recordVideo: { dir: rawVideoDirectory('mobile'), size: { width: 390, height: 844 } },
  })
  const page = await context.newPage()
  await page.goto('/')
  await settle(page)
  await page.waitForTimeout(1600)

  for (const id of ['work', 'stack', 'selected-work', 'journey', 'credentials', 'ai', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(620)
  }

  await saveRecording(page, 'mobile', '03-mobile-390-pass.webm')
})

test('captures the Phase 10 static acceptance states', async ({ browser }) => {
  test.setTimeout(120_000)

  // Desktop full page.
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  })
  const desktop = await desktopContext.newPage()
  await desktop.goto('/')
  await settle(desktop)
  await desktop.waitForTimeout(2200)
  await fullPage(desktop, '04-desktop-1440-full-page.png')
  await desktop.addStyleTag({ content: chromeless })
  await desktop.locator('#work').scrollIntoViewIfNeeded()
  await desktop.waitForTimeout(700)
  await desktop.screenshot({
    path: resolve(artifactDirectory, '05-desktop-planify-3d-lifecycle.png'),
    animations: 'disabled',
  })
  await desktopContext.close()

  // Reduced motion full page.
  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  })
  const reduced = await reducedContext.newPage()
  await reduced.goto('/')
  await settle(reduced)
  await fullPage(reduced, '06-reduced-motion-full-page.png')
  await reducedContext.close()

  // Mobile full page at the narrowest and the common width.
  for (const width of [320, 390]) {
    const { context, page } = await touchPage(browser, { width, height: 844 })
    await page.waitForTimeout(1400)
    await fullPage(page, `07-mobile-${width}-full-page.png`)
    await context.close()
  }

  // Real 200% browser zoom and the WCAG reflow width.
  for (const [width, height, label] of [
    [720, 450, '200'],
    [320, 512, '400'],
  ] as Array<[number, number, string]>) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      colorScheme: 'dark',
    })
    const page = await context.newPage()
    await page.goto('/')
    await settle(page)
    await fullPage(page, `08-zoom-${label}pct-reflow-${width}px.png`)
    await context.close()
  }

  // Short landscape.
  const { context: landscapeContext, page: landscape } = await touchPage(
    browser,
    { width: 667, height: 375 },
  )
  await landscape.locator('#ai').scrollIntoViewIfNeeded()
  await landscape.waitForTimeout(500)
  await landscape.screenshot({
    path: resolve(artifactDirectory, '09-short-landscape-ai.png'),
    animations: 'disabled',
  })
  await landscapeContext.close()

  // Keyboard focus evidence on the previously unindicated composer.
  const focusContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  })
  const focusPage = await focusContext.newPage()
  await focusPage.goto('/')
  await settle(focusPage)
  await focusPage.locator('#ai').scrollIntoViewIfNeeded()
  await focusPage.locator('#assistant-composer-inline').focus()
  await focusPage.keyboard.press('Shift+Tab')
  await focusPage.keyboard.press('Tab')
  await focusPage.waitForTimeout(300)
  await focusPage.locator('.ai-section-panel').screenshot({
    path: resolve(artifactDirectory, '10-assistant-composer-focus-ring.png'),
    animations: 'disabled',
  })
  await focusContext.close()
})
