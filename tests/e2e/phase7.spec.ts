import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { portfolio } from '../../shared/portfolio.ts'

const evidenceDirectory = resolve('artifacts/phase7')
const availableCredentials = portfolio.credentials.filter(
  (credential) => credential.asset.status === 'available' && credential.asset.src,
)

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function openJourney(page: Page) {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.locator('#journey .section-heading').scrollIntoViewIfNeeded()
  await expect(page.locator('#journey')).toBeVisible()
}

async function positionJourneyStage(page: Page, stage: string) {
  const journey = page.locator('#journey')
  const stageElement = journey.locator(`[data-journey-stage="${stage}"]`)
  await stageElement.evaluate((element) => {
    document.documentElement.style.scrollBehavior = 'auto'
    const stageTop = window.scrollY + element.getBoundingClientRect().top
    window.scrollTo(0, stageTop - window.innerHeight * 0.4)
  })
  await expect(journey).toHaveAttribute('data-active-stage', stage)
}

async function waitForCertificatePreviews(page: Page) {
  const credentials = page.locator('#credentials')
  const previews = credentials.locator('.credential-item__preview img')
  await credentials.scrollIntoViewIfNeeded()
  await expect(previews).toHaveCount(availableCredentials.length)
  for (const preview of await previews.all()) {
    await preview.scrollIntoViewIfNeeded()
    await expect.poll(() => preview.evaluate((element) => {
      const image = element as HTMLImageElement
      return image.complete && image.naturalWidth > 0
    })).toBe(true)
  }
  await expect.poll(() => previews.evaluateAll((images) =>
    images.every((image) => (
      image instanceof HTMLImageElement
      && image.complete
      && image.naturalWidth > 0
    )),
  )).toBe(true)
  await credentials.scrollIntoViewIfNeeded()
}

async function openTouchPage(
  browser: Browser,
  viewport: { width: number; height: number },
) {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    hasTouch: true,
    isMobile: true,
    viewport,
  })
  const page = await context.newPage()
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  return { context, page }
}

test('renders a connected canonical progression after Selected Work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openJourney(page)

  const journey = page.locator('#journey')
  const stages = journey.locator('.journey-stage')
  await expect(stages).toHaveCount(4)
  await expect(stages.nth(0).getByRole('heading')).toHaveText(
    'Master’s degree in Business Administration',
  )
  await expect(stages.nth(1).getByRole('heading')).toHaveText('Computer Technician & IT Support')
  await expect(stages.nth(2).getByRole('heading')).toHaveText(
    'Master of Science in Informatics Engineering',
  )
  await expect(stages.nth(3).getByRole('heading')).toHaveText('Building software as a product')
  await expect(stages.nth(0)).toContainText(
    'Completing my Master’s degree in Business Administration gave me a strong understanding',
  )
  await expect(stages.nth(2)).toContainText(
    'completed my Master of Science in Informatics Engineering in July 2026',
  )
  await expect(journey.getByText('Completed July 2026')).toBeVisible()

  const publicCopy = await journey.innerText()
  expect(publicCopy).not.toMatch(/currently studying|2024\s*[-–]\s*present/i)
  expect(publicCopy).not.toMatch(/confirmed|verified|evidence|approved|validation|claim/i)

  const order = await page.locator('main > section').evaluateAll((sections) =>
    sections.map((section) => section.id),
  )
  expect(order).toEqual([
    'top',
    'work',
    'stack',
    'selected-work',
    'journey',
    'credentials',
    'ai',
    'contact',
  ])
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('activates Journey stages in the desktop reading zone without pinning or scroll hijacking', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openJourney(page)

  const journey = page.locator('#journey')
  await positionJourneyStage(page, 'systems')
  await expect.poll(() => journey.evaluate((element) => ({
    sectionStage: element.dataset.activeStage,
    activeItemStage: element
      .querySelector<HTMLElement>('[data-stage-state="active"]')
      ?.dataset.journeyStage,
  }))).toEqual({
    sectionStage: 'systems',
    activeItemStage: 'systems',
  })

  const behavior = await journey.evaluate((element) => ({
    position: getComputedStyle(element).position,
    scrollSnapType: getComputedStyle(document.documentElement).scrollSnapType,
  }))
  expect(behavior.position).toBe('relative')
  expect(behavior.scrollSnapType).toBe('none')
})

test('renders exactly the canonical Credentials metadata and no invented verification action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#credentials')
  const credentials = page.locator('#credentials')

  await expect(credentials.locator('.credential-item')).toHaveCount(3)
  await expect(credentials.getByText('23 June 2026')).toBeVisible()
  await expect(credentials.getByText('Ligency, Ed Donner')).toBeVisible()
  await expect(credentials.getByText('Dr. Angela Yu')).toBeVisible()
  await expect(credentials.getByRole('link', { name: /verify/i })).toHaveCount(0)
  await expect(credentials.getByRole('button', { name: /View certificate/i })).toHaveCount(
    availableCredentials.length,
  )
  expect(availableCredentials).toHaveLength(3)
  await waitForCertificatePreviews(page)
  for (const credential of availableCredentials) {
    const response = await page.request.get(credential.asset.src!)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('image/jpeg')
  }
})

test('opens every real certificate accessibly, closes with Escape, and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#credentials')

  for (const credential of availableCredentials) {
    const trigger = page.getByRole('button', {
      name: `View certificate: ${credential.title}`,
    })
    await trigger.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close certificate viewer' })).toBeFocused()
    await expect(dialog.getByRole('img')).toHaveAttribute('src', credential.asset.src!)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  }
})

test('preserves complete information with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 720 },
  })
  const page = await context.newPage()
  await openJourney(page)

  const journey = page.locator('#journey')
  await expect(journey).toHaveAttribute('data-motion-mode', 'reduced')
  for (const stage of await journey.locator('.journey-stage').all()) {
    await expect(stage).toHaveAttribute('data-revealed', 'true')
    await expect(stage).toHaveCSS('transform', 'none')
  }
  await expect(page.locator('#credentials .credential-item')).toHaveCount(3)
  await context.close()
})

for (const viewport of [
  { name: 'minimum phone', width: 320, height: 568 },
  { name: 'small phone', width: 360, height: 640 },
  { name: 'compact phone', width: 375, height: 667 },
  { name: 'standard phone', width: 390, height: 844 },
  { name: 'large phone', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'short landscape phone', width: 667, height: 375 },
]) {
  test(`keeps Journey and Credentials readable without overflow at ${viewport.name}`, async ({ browser }) => {
    const { context, page } = await openTouchPage(browser, viewport)

    for (const sectionId of ['journey', 'credentials']) {
      await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded()
      await expectNoHorizontalOverflow(page)
    }

    await expect(page.locator('#journey .journey-stage')).toHaveCount(4)
    await expect(page.locator('#credentials .credential-item')).toHaveCount(3)
    await context.close()
  })
}

test('captures Phase 7 desktop and mobile visual evidence', async ({ browser }) => {
  test.setTimeout(60_000)
  await mkdir(evidenceDirectory, { recursive: true })

  const desktop = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    viewport: { width: 1440, height: 900 },
  })
  const desktopPage = await desktop.newPage()
  await openJourney(desktopPage)
  await desktopPage.addStyleTag({
    content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
  })

  const journey = desktopPage.locator('#journey')
  await positionJourneyStage(desktopPage, 'business')
  await journey.screenshot({
    path: resolve(evidenceDirectory, '01-desktop-journey-default.png'),
    animations: 'disabled',
  })

  await positionJourneyStage(desktopPage, 'engineering')
  await desktopPage.screenshot({
    path: resolve(evidenceDirectory, '02-desktop-journey-active.png'),
    animations: 'disabled',
  })
  await waitForCertificatePreviews(desktopPage)
  await desktopPage.locator('#credentials').screenshot({
    path: resolve(evidenceDirectory, '03-desktop-credentials.png'),
    animations: 'disabled',
  })

  const certificateEvidenceNames = [
    '04-desktop-certificate-software-engineering.png',
    '05-desktop-certificate-ai-coder.png',
    '06-desktop-certificate-age-of-ai.png',
  ]
  for (const [index, credential] of availableCredentials.entries()) {
    const trigger = desktopPage.getByRole('button', {
      name: `View certificate: ${credential.title}`,
    })
    await trigger.click()
    await desktopPage.getByRole('dialog').screenshot({
      path: resolve(evidenceDirectory, certificateEvidenceNames[index]),
      animations: 'disabled',
    })
    await desktopPage.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }
  await desktop.close()

  const mobile = await openTouchPage(browser, { width: 390, height: 844 })
  await mobile.page.addStyleTag({
    content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
  })
  await mobile.page.locator('#journey').screenshot({
    path: resolve(evidenceDirectory, '07-mobile-390-journey.png'),
    animations: 'disabled',
  })
  await waitForCertificatePreviews(mobile.page)
  await mobile.page.locator('#credentials').screenshot({
    path: resolve(evidenceDirectory, '08-mobile-390-credentials.png'),
    animations: 'disabled',
  })

  await mobile.page.getByRole('button', {
    name: `View certificate: ${availableCredentials[0].title}`,
  }).click()
  await mobile.page.screenshot({
    path: resolve(evidenceDirectory, '09-mobile-390-certificate-open.png'),
    animations: 'disabled',
  })
  await mobile.page.keyboard.press('Escape')
  await mobile.context.close()
})
