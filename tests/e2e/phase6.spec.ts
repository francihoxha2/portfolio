import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'

const evidenceDirectory = resolve('artifacts/phase6')

async function openSystem(page: Page) {
  await page.goto('/#stack')
  const system = page.locator('#stack')
  await system.locator('.engineering-system__heading').scrollIntoViewIfNeeded()
  await expect(system.getByRole('heading', {
    name: 'One stack. Connected by how software works.',
  })).toBeInViewport()
  await expect(system).toHaveAttribute('data-assembled', 'true')
  return system
}

async function closeContext(context: BrowserContext) {
  await context.close()
}

test('keeps the corrected Planify public voice and captures its final copy', async ({ page }) => {
  await mkdir(evidenceDirectory, { recursive: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#work')

  const flagship = page.locator('#work')
  await expect(
    flagship.getByText('Planify is my flagship software project.', { exact: true }),
  ).toBeVisible()
  await expect(
    flagship.getByText(
      'This is where the Developer Universe becomes real software—a product I’ve designed, built, and developed across the stack.',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(flagship).not.toContainText('confirmed portfolio scope')
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
  await expect(flagship.locator('.flagship-section__intro')).toHaveCSS('opacity', '1')

  await page.addStyleTag({
    content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
  })
  await flagship.locator('.flagship-section__intro').screenshot({
    path: resolve(evidenceDirectory, '00-planify-public-copy.png'),
    animations: 'disabled',
  })
})

test('runs one bounded assembly and settles without continuous system animation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const system = page.locator('#stack')
  await expect(system).toHaveAttribute('data-assembled', 'false')

  await system.locator('.engineering-system__heading').scrollIntoViewIfNeeded()
  await expect(system).toHaveAttribute('data-assembled', 'true')
  await page.waitForTimeout(1_100)

  const infiniteAnimations = await system.evaluate((element) =>
    element
      .getAnimations({ subtree: true })
      .filter((animation) => animation.effect?.getTiming().iterations === Infinity)
      .length,
  )
  expect(infiniteAnimations).toBe(0)
})

test('renders the required semantic groups, exact languages, and one-canvas architecture', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const system = await openSystem(page)
  const desktop = system.locator('[data-testid="engineering-desktop-map"]')

  for (const title of [
    'Frontend',
    'Backend / APIs',
    'Data',
    'Mobile',
    'AI',
    'Engineering / Delivery',
    'Languages',
  ]) {
    await expect(desktop.getByRole('heading', { name: title })).toBeVisible()
  }

  const languageButtons = desktop
    .locator('[data-cluster-id="languages"] [data-capability-id] button')
  await expect(languageButtons).toHaveCount(4)
  expect(await languageButtons.allTextContents()).toEqual([
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
  ])
  await expect(system).not.toContainText('Additional Engineering Language')

  const java = desktop.locator('[data-capability-id="java"]')
  await expect(java).toHaveAttribute('data-prominence', 'primary')
  await expect(java).not.toContainText('Secondary')
  await expect(java).toContainText(
    'I use Java as one of the programming languages in my development toolkit.',
  )
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('fine-pointer interaction propagates React and FastAPI states deterministically', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const system = await openSystem(page)
  const desktop = system.locator('[data-testid="engineering-desktop-map"]')

  await desktop.getByRole('button', { name: 'React' }).hover()
  await expect(system).toHaveAttribute('data-active-capability', 'react')
  await expect(system).toHaveAttribute('data-active-cluster', 'frontend')
  await expect(desktop.locator('[data-cluster-id="frontend"]')).toHaveAttribute(
    'data-cluster-state',
    'active',
  )
  await expect(desktop.locator('[data-cluster-id="backend"]')).toHaveAttribute(
    'data-cluster-state',
    'related',
  )
  await expect(desktop.locator('[data-capability-id="javascript"]')).toHaveAttribute(
    'data-capability-state',
    'related',
  )
  await expect(desktop.locator('[data-path-id="frontend-backend"]')).toHaveAttribute(
    'data-path-state',
    'active',
  )
  await expect(system.locator('#engineering-system-evidence')).toContainText(
    'component-based application interfaces',
  )

  await desktop.getByRole('button', { name: 'FastAPI' }).hover()
  await expect(system).toHaveAttribute('data-active-capability', 'fastapi')
  await expect(desktop.locator('[data-capability-id="python"]')).toHaveAttribute(
    'data-capability-state',
    'related',
  )
  await expect(desktop.locator('[data-path-id="backend-data"]')).toHaveAttribute(
    'data-path-state',
    'active',
  )
  await expect(system.locator('#engineering-system-evidence')).toContainText(
    'Used with Python for API-oriented backend work',
  )
})

test('keyboard focus produces the same system state and keeps a logical reset path', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const system = await openSystem(page)
  const desktop = system.locator('[data-testid="engineering-desktop-map"]')
  const testing = desktop.getByRole('button', { name: 'Testing' })

  await testing.focus()
  await expect(testing).toBeFocused()
  await expect(testing).toHaveAttribute('aria-pressed', 'true')
  await expect(system).toHaveAttribute('data-active-capability', 'testing')
  await expect(desktop.locator('[data-path-id="engineering-core"]')).toHaveAttribute(
    'data-path-state',
    'active',
  )
  await expect(system.locator('#engineering-system-evidence')).toContainText(
    'reduce regression risk',
  )

  const core = desktop.getByRole('button', { name: 'Show Full-Stack system overview' })
  await core.focus()
  await expect(system).toHaveAttribute('data-active-capability', 'full-stack')
  await expect(core).toHaveAttribute('aria-pressed', 'true')
})

test('coarse-pointer mobile uses disclosures and tap evidence without horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  const system = await openSystem(page)
  const mobile = system.locator('[data-testid="engineering-mobile-map"]')

  await expect(mobile).toBeVisible()
  await expect(system.locator('[data-testid="engineering-desktop-map"]')).toBeHidden()
  const disclosures = mobile.locator('.engineering-mobile-cluster h3 > button')
  await expect(disclosures).toHaveCount(7)

  const languages = mobile.getByRole('button', { name: /Languages/ })
  await languages.click()
  await expect(languages).toHaveAttribute('aria-expanded', 'true')
  await expect(mobile.getByRole('button', { name: 'JavaScript' })).toBeVisible()
  await expect(mobile.getByRole('button', { name: 'TypeScript' })).toBeVisible()
  await expect(mobile.getByRole('button', { name: 'Python' })).toBeVisible()
  await expect(mobile.getByRole('button', { name: 'Java', exact: true })).toBeVisible()

  await mobile.getByRole('button', { name: 'Python' }).click()
  await expect(system).toHaveAttribute('data-active-capability', 'python')
  await expect(system.locator('#engineering-system-evidence')).toContainText(
    'including FastAPI',
  )

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
  await closeContext(context)
})

test('reduced motion is immediate, static, and keeps relationship states visible', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 720 },
  })
  const page = await context.newPage()
  const system = await openSystem(page)
  const desktop = system.locator('[data-testid="engineering-desktop-map"]')

  await expect(system).toHaveAttribute('data-motion-mode', 'reduced')
  await expect(system).toHaveAttribute('data-assembled', 'true')
  await desktop.getByRole('button', { name: 'AI integration' }).click()
  await expect(system).toHaveAttribute('data-active-capability', 'ai-integration')
  await expect(desktop.locator('[data-path-id="backend-ai"]')).toHaveAttribute(
    'data-path-state',
    'active',
  )
  await expect(desktop.locator('[data-path-id="backend-ai"] .engineering-path__trace')).toHaveCSS(
    'animation-name',
    'none',
  )
  await closeContext(context)
})

test('forced colors keeps semantic controls and selected relationships readable', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    forcedColors: 'active',
    viewport: { width: 1280, height: 720 },
  })
  const page = await context.newPage()
  const system = await openSystem(page)
  const desktop = system.locator('[data-testid="engineering-desktop-map"]')

  await expect(desktop.locator('svg')).toHaveCSS('display', 'none')
  await desktop.getByRole('button', { name: 'React' }).click()
  await expect(system).toHaveAttribute('data-active-capability', 'react')
  await expect(desktop.locator('[data-capability-id="react"] button')).toHaveCSS(
    'outline-style',
    'solid',
  )
  await expect(system.locator('#engineering-system-evidence')).toContainText(
    'System relationship',
  )
  await closeContext(context)
})

test('system meaning remains available when SVG is removed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const system = await openSystem(page)

  await system.locator('svg').evaluate((svg) => svg.remove())
  await page.mouse.move(1, 1)
  await system.locator('[data-testid="engineering-desktop-map"]')
    .getByRole('button', { name: 'MongoDB' })
    .focus()
  await expect(system).toHaveAttribute('data-active-capability', 'mongodb')
  await expect(system.locator('#engineering-system-evidence')).toContainText(
    'database-backed application work',
  )
  await expect(system.getByRole('heading', { name: 'Data', exact: true })).toBeVisible()
})

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'short laptop', width: 1280, height: 720 },
  { name: 'minimum phone', width: 320, height: 568 },
  { name: 'zoom-equivalent compact viewport', width: 720, height: 450 },
]) {
  test(`has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const system = await openSystem(page)

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
    await expect(system.locator('#engineering-system-evidence')).toBeVisible()
  })
}

test('captures desktop default, active, laptop, mobile, and reduced-motion evidence', async ({ browser }) => {
  test.setTimeout(60_000)
  await mkdir(evidenceDirectory, { recursive: true })

  const scenarios = [
    {
      name: '01-desktop-default.png',
      viewport: { width: 1440, height: 900 },
    },
    {
      name: '03-short-laptop.png',
      viewport: { width: 1280, height: 720 },
    },
    {
      name: '04-mobile-system.png',
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    },
    {
      name: '05-reduced-motion.png',
      viewport: { width: 1280, height: 720 },
      reducedMotion: 'reduce' as const,
    },
  ]

  for (const scenario of scenarios) {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:4173',
      colorScheme: 'dark',
      viewport: scenario.viewport,
      isMobile: scenario.isMobile,
      hasTouch: scenario.hasTouch,
      reducedMotion: scenario.reducedMotion,
    })
    const page = await context.newPage()
    const system = await openSystem(page)
    await page.addStyleTag({
      content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
    })
    if (scenario.name === '04-mobile-system.png') {
      const mobile = system.locator('[data-testid="engineering-mobile-map"]')
      await mobile.getByRole('button', { name: /Languages/ }).click()
      await expect(mobile.getByRole('button', { name: 'Java', exact: true })).toBeVisible()
    }
    await system.screenshot({
      path: resolve(evidenceDirectory, scenario.name),
      animations: 'disabled',
    })
    await closeContext(context)
  }

  const activeContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    viewport: { width: 1440, height: 900 },
  })
  const activePage = await activeContext.newPage()
  const activeSystem = await openSystem(activePage)
  await activePage.addStyleTag({
    content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
  })
  await activeSystem
    .locator('[data-testid="engineering-desktop-map"]')
    .getByRole('button', { name: 'React' })
    .click()
  await activePage.mouse.move(1, 1)
  await expect(activeSystem).toHaveAttribute('data-active-capability', 'react')
  await activeSystem.screenshot({
    path: resolve(evidenceDirectory, '02-desktop-active-react.png'),
    animations: 'disabled',
  })
  await closeContext(activeContext)
})

test('records the live assembly, pointer propagation, evidence updates, and keyboard focus', async ({ browser }) => {
  const playwrightFfmpeg = join(
    process.env.LOCALAPPDATA ?? '',
    'ms-playwright',
    'ffmpeg-1011',
    'ffmpeg-win64.exe',
  )
  test.skip(!existsSync(playwrightFfmpeg), 'Playwright FFmpeg is unavailable in this environment.')
  test.setTimeout(60_000)
  await mkdir(evidenceDirectory, { recursive: true })
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: evidenceDirectory, size: { width: 1280, height: 720 } },
  })
  const page = await context.newPage()
  const video = page.video()
  const system = await openSystem(page)
  const desktop = system.locator('[data-testid="engineering-desktop-map"]')

  await page.waitForTimeout(700)
  for (const name of ['React', 'FastAPI', 'MongoDB', 'AI integration']) {
    await desktop.getByRole('button', { name }).hover()
    await page.waitForTimeout(520)
  }
  await desktop.getByRole('button', { name: 'Testing' }).focus()
  await page.waitForTimeout(700)
  await desktop.getByRole('button', { name: 'Show Full-Stack system overview' }).focus()
  await page.waitForTimeout(520)

  await page.close()
  if (video) {
    await video.saveAs(resolve(evidenceDirectory, '06-phase6-live-interaction.webm'))
  }
  await closeContext(context)
})
