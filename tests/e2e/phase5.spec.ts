import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const evidenceDirectory = resolve('artifacts/phase5')

async function openSelectedWork(page: Page) {
  await page.goto('/')
  await page.locator('#selected-work .section-heading').scrollIntoViewIfNeeded()
  await expect(page.locator('#selected-work .section-heading')).toBeInViewport()
}

test('renders both evidence-limited selected projects with correct link semantics', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openSelectedWork(page)

  const selectedWork = page.locator('#selected-work')
  await expect(selectedWork.getByRole('heading', { name: 'BarberSpot.al' })).toBeVisible()
  await expect(
    selectedWork.getByRole('heading', {
      name: 'Online Charging Station Management System',
    }),
  ).toBeVisible()
  await expect(selectedWork.locator('.selected-project')).toHaveCount(2)
  await expect(selectedWork.getByText('Abstract composition - not product UI')).toHaveCount(2)

  const barberSpotLink = selectedWork.getByRole('link', {
    name: /View BarberSpot.*opens in a new tab/,
  })
  await expect(barberSpotLink).toHaveAttribute('href', 'https://barberspot.al')
  await expect(barberSpotLink).toHaveAttribute('target', '_blank')
  await expect(barberSpotLink).toHaveAttribute('rel', /noreferrer/)

  const chargingLink = selectedWork.getByRole('link', { name: 'Discuss the project' })
  await expect(chargingLink).toHaveAttribute('href', '#contact')
  await expect(chargingLink).not.toHaveAttribute('target', '_blank')

  const visibleCopy = await selectedWork.innerText()
  expect(visibleCopy).not.toMatch(
    /appointments?|customers?|payments?|analytics|real-time|IoT|hardware|maps?/i,
  )
  await expect(page.locator('canvas')).toHaveCount(1)
})

test('supports keyboard evidence exploration and deterministic fine-pointer depth', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openSelectedWork(page)

  const project = page.locator('[data-project-id="barberspot"]')
  await expect(project).toHaveAttribute('data-pointer-mode', 'fine')
  const inspect = project.locator('.selected-project__inspect')
  await expect(inspect).toHaveAccessibleName('Inspect evidence')
  await inspect.focus()
  await page.keyboard.press('Enter')
  await expect(inspect).toHaveAttribute('aria-pressed', 'true')
  await expect(project).toHaveAttribute('data-evidence-state', 'revealed')
  await expect(project.getByText('External project site')).toBeVisible()

  await page.keyboard.press('Enter')
  await expect(inspect).toHaveAttribute('aria-pressed', 'false')
  const bounds = await project.boundingBox()
  if (!bounds) throw new Error('BarberSpot project bounds are unavailable.')
  await page.mouse.move(bounds.x + bounds.width * 0.82, bounds.y + bounds.height * 0.3)
  await expect(project).toHaveAttribute('data-evidence-state', 'revealed')
  await expect
    .poll(() => project.evaluate((element) => element.style.getPropertyValue('--selected-x')))
    .not.toBe('0.0000')
})

test('coarse-pointer mobile stacks cleanly and keeps tap evidence available', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await openSelectedWork(page)

  const project = page.locator('[data-project-id="barberspot"]')
  await expect(project).toHaveAttribute('data-pointer-mode', 'coarse')
  await project.getByRole('button', { name: 'Inspect evidence' }).click()
  await expect(project).toHaveAttribute('data-evidence-state', 'revealed')
  await expect(project.getByText('External project site')).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
  await context.close()
})

test('reduced motion keeps the complete composition static and operable', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 720 },
  })
  const page = await context.newPage()
  await openSelectedWork(page)

  const section = page.locator('#selected-work')
  const project = page.locator('[data-project-id="barberspot"]')
  await expect(section).toHaveAttribute('data-motion-mode', 'reduced')
  await expect(project).toHaveAttribute('data-pointer-mode', 'reduced')
  await expect(project).toHaveAttribute('data-revealed', 'true')
  await expect(project.locator('.selected-project__visual-frame')).toHaveCSS('transform', 'none')
  await project.getByRole('button', { name: 'Inspect evidence' }).click()
  await expect(project).toHaveAttribute('data-evidence-state', 'revealed')
  await context.close()
})

test('continues from Planify into Selected Work through normal document scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#work')

  const planify = page.locator('#work')
  const selectedWork = page.locator('#selected-work')
  const story = page.locator('.hero-planify-story')
  const scene = page.locator('.hero-scene-slot')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(planify.getByRole('heading', { name: 'Planify.al' })).toBeInViewport()

  const flow = await page.evaluate(() => {
    const planifySection = document.querySelector<HTMLElement>('#work')!
    const selectedSection = document.querySelector<HTMLElement>('#selected-work')!
    return {
      planifyBottom: planifySection.offsetTop + planifySection.offsetHeight,
      selectedTop: selectedSection.offsetTop,
      selectedPosition: getComputedStyle(selectedSection).position,
      scrollSnapType: getComputedStyle(document.documentElement).scrollSnapType,
    }
  })
  expect(flow.selectedTop).toBeGreaterThanOrEqual(flow.planifyBottom - 1)
  expect(flow.selectedPosition).toBe('relative')
  expect(flow.scrollSnapType).toBe('none')

  await selectedWork.locator('.section-heading').scrollIntoViewIfNeeded()
  await expect(selectedWork.locator('.section-heading')).toBeInViewport()
  await expect(scene).toHaveAttribute('data-scene-active', 'false')
  await expect(page.locator('canvas')).toHaveCount(1)
})

for (const viewport of [
  { name: 'minimum phone', width: 320, height: 568 },
  { name: 'short laptop', width: 1280, height: 720 },
]) {
  test(`has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await openSelectedWork(page)

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
    await expect(
      page.locator('#selected-work').getByRole('heading', {
        name: 'Online Charging Station Management System',
      }),
    ).toBeVisible()
  })
}

test('captures stable desktop, laptop, mobile, and reduced-motion evidence', async ({ browser }) => {
  test.setTimeout(45_000)
  await mkdir(evidenceDirectory, { recursive: true })

  const scenarios = [
    {
      name: '01-desktop-selected-work.png',
      viewport: { width: 1440, height: 900 },
    },
    {
      name: '02-short-laptop-selected-work.png',
      viewport: { width: 1280, height: 720 },
    },
    {
      name: '03-mobile-selected-work.png',
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    },
    {
      name: '04-reduced-motion-selected-work.png',
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
    await openSelectedWork(page)
    await page.addStyleTag({
      content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
    })
    await page.evaluate(() => {
      document.querySelectorAll<HTMLElement>('[data-selected-reveal]').forEach((element) => {
        element.dataset.revealed = 'true'
      })
    })
    await page.locator('#selected-work').screenshot({
      path: resolve(evidenceDirectory, scenario.name),
      animations: 'disabled',
    })
    await context.close()
  }
})
