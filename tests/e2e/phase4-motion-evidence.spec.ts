import { existsSync, readdirSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const recordingRequested = process.env.PHASE4_EVIDENCE === '1'

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

test.skip(
  !recordingRequested,
  'Set PHASE4_EVIDENCE=1 to create the Hero-to-Planify motion recording.',
)
async function scrollSlowly(
  page: Page,
  from: number,
  to: number,
  duration = 2_400,
) {
  const steps = Math.max(30, Math.round(duration / 45))
  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps
    const eased = progress * progress * (3 - 2 * progress)
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), from + (to - from) * eased)
    await page.waitForTimeout(duration / steps)
  }
}

test('records the complete reversible Phase 4 handoff', async ({ browser }) => {
  test.setTimeout(75_000)
  const evidenceDirectory = resolve('artifacts/phase4')
  const videoPath = resolve(evidenceDirectory, 'phase4-planify-handoff.webm')
  const videoAvailable = hasPlaywrightFfmpeg()
  await mkdir(evidenceDirectory, { recursive: true })

  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    viewport: { width: 1440, height: 900 },
    ...(videoAvailable ? {
      recordVideo: {
        dir: evidenceDirectory,
        size: { width: 1440, height: 900 },
      },
    } : {}),
  })
  const page = await context.newPage()
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
  })

  const story = page.locator('.hero-planify-story')
  const slot = page.locator('.hero-scene-slot')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-arrival'))).toBeGreaterThan(0.98)
  await page.waitForTimeout(2_800)
  await page.screenshot({ path: resolve(evidenceDirectory, '01-active-universe.png') })

  const distance = Number(await story.getAttribute('data-transition-distance'))
  await scrollSlowly(page, 0, distance * 0.34, 2_500)
  await expect(story).toHaveAttribute('data-transition-phase', 'convergence')
  await page.waitForTimeout(900)
  await page.screenshot({ path: resolve(evidenceDirectory, '02-convergence.png') })

  await scrollSlowly(page, distance * 0.34, distance * 0.58, 2_200)
  await expect(story).toHaveAttribute('data-transition-phase', 'monitor-focus')
  await page.waitForTimeout(850)
  await page.screenshot({ path: resolve(evidenceDirectory, '03-monitor-focus.png') })

  await scrollSlowly(page, distance * 0.58, distance * 0.76, 2_300)
  await expect(story).toHaveAttribute('data-transition-phase', 'visual-handoff')
  await page.waitForTimeout(850)
  await page.screenshot({ path: resolve(evidenceDirectory, '04-visual-handoff.png') })

  await scrollSlowly(page, distance * 0.76, distance, 2_500)
  await expect(story).toHaveAttribute('data-transition-phase', 'dom-ownership')
  await page.waitForTimeout(2_400)
  await page.screenshot({ path: resolve(evidenceDirectory, '05-dom-ownership.png') })

  await scrollSlowly(page, distance, 0, 5_600)
  await expect.poll(async () => Number(await story.getAttribute('data-transition-progress'))).toBeLessThan(0.01)
  await page.waitForTimeout(2_000)

  const video = page.video()
  await page.close()
  if (videoAvailable) {
    if (!video) throw new Error('Chrome did not provide a recording handle.')
    await video.saveAs(videoPath)
  }
  await context.close()
})

test('captures the responsive and reduced-motion Planify alternatives', async ({ browser }) => {
  test.setTimeout(35_000)
  const evidenceDirectory = resolve('artifacts/phase4')
  await mkdir(evidenceDirectory, { recursive: true })

  const mobileContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto('/#work')
  await expect(mobilePage.locator('.hero-planify-story')).toHaveAttribute(
    'data-transition-mode',
    'simplified',
  )
  await mobilePage.locator('#work').scrollIntoViewIfNeeded()
  await expect(mobilePage.locator('#work').getByRole('heading', { name: 'Planify.al' })).toBeInViewport()
  await mobilePage.screenshot({
    path: resolve(evidenceDirectory, '06-mobile-planify.png'),
  })
  await mobileContext.close()

  const reducedContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 720 },
  })
  const reducedPage = await reducedContext.newPage()
  await reducedPage.goto('/#work')
  await expect(reducedPage.locator('.hero-planify-story')).toHaveAttribute(
    'data-transition-bypassed',
    'true',
  )
  await reducedPage.locator('#work').scrollIntoViewIfNeeded()
  await expect(reducedPage.locator('#work').getByRole('heading', { name: 'Planify.al' })).toBeInViewport()
  await reducedPage.screenshot({
    path: resolve(evidenceDirectory, '07-reduced-motion-planify.png'),
  })
  await reducedContext.close()
})
