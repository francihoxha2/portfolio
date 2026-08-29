import { existsSync, readdirSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const recordingRequested = process.env.PHASE3B_EVIDENCE === '1'

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
  'Set PHASE3B_EVIDENCE=1 to create the manual motion-review recording.',
)
test.skip(
  recordingRequested && !hasPlaywrightFfmpeg(),
  'The Playwright FFmpeg binary is unavailable in this environment.',
)

async function movePointerSlowly(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  duration = 900,
) {
  const steps = 24
  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps
    await page.mouse.move(
      from.x + (to.x - from.x) * progress,
      from.y + (to.y - from.y) * progress,
    )
    await page.waitForTimeout(duration / steps)
  }
}

async function scrollSlowly(
  page: Page,
  from: number,
  to: number,
  duration = 1_700,
) {
  const steps = 28
  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), from + (to - from) * progress)
    await page.waitForTimeout(duration / steps)
  }
}

test('records the Phase 3B live motion acceptance sequence', async ({ browser }) => {
  test.setTimeout(45_000)
  const evidenceDirectory = resolve('artifacts/phase3b')
  const videoPath = resolve(evidenceDirectory, 'phase3b-motion-evidence.webm')
  await mkdir(evidenceDirectory, { recursive: true })

  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: evidenceDirectory,
      size: { width: 1440, height: 900 },
    },
  })
  const page = await context.newPage()
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-arrival'))).toBeGreaterThan(0.98)
  await page.waitForTimeout(4_000)

  const hero = await page.locator('#top').boundingBox()
  if (!hero) throw new Error('Hero bounds were unavailable for motion recording.')
  const center = { x: hero.x + hero.width * 0.58, y: hero.y + hero.height * 0.5 }
  const topRight = { x: hero.x + hero.width * 0.9, y: hero.y + hero.height * 0.22 }
  const bottomRight = { x: hero.x + hero.width * 0.84, y: hero.y + hero.height * 0.76 }
  const bottomLeft = { x: hero.x + hero.width * 0.2, y: hero.y + hero.height * 0.7 }
  const topLeft = { x: hero.x + hero.width * 0.26, y: hero.y + hero.height * 0.24 }

  await page.mouse.move(center.x, center.y)
  await movePointerSlowly(page, center, topRight)
  await movePointerSlowly(page, topRight, bottomRight)
  await movePointerSlowly(page, bottomRight, bottomLeft)
  await movePointerSlowly(page, bottomLeft, topLeft)
  await movePointerSlowly(page, topLeft, center)

  await movePointerSlowly(page, center, { x: 5, y: 5 }, 1_100)
  await expect(slot).toHaveAttribute('data-scene-pointer-active', 'false')
  await page.waitForTimeout(1_500)

  const recessionDistance = Math.min(430, Math.round(hero.height * 0.48))
  await scrollSlowly(page, 0, recessionDistance)
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-recession'))).toBeGreaterThan(0.25)
  await page.waitForTimeout(1_100)
  await scrollSlowly(page, recessionDistance, 0)
  await expect.poll(async () => Number(await slot.getAttribute('data-scene-recession'))).toBeLessThan(0.01)
  await page.waitForTimeout(1_200)

  const video = page.video()
  await page.close()
  if (!video) throw new Error('Chrome did not provide a recording handle.')
  await video.saveAs(videoPath)
  await context.close()
})
