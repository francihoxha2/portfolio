import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Browser, type Page } from '@playwright/test'

const artifactDirectory = resolve('artifacts/phase6-mobile')
const publicSectionOrder = [
  'top',
  'work',
  'stack',
  'selected-work',
  'journey',
  'credentials',
  'ai',
  'contact',
]

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.body.querySelectorAll<HTMLElement>('*'))
      .flatMap((element) => {
        const style = getComputedStyle(element)
        const bounds = element.getBoundingClientRect()
        if (
          style.display === 'none'
          || style.visibility === 'hidden'
          || (bounds.left >= -1 && bounds.right <= document.documentElement.clientWidth + 1)
        ) return []

        return [{
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.className && typeof element.className === 'string' ? `.${element.className.trim().replaceAll(' ', '.')}` : ''}`,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          overflowX: style.overflowX,
        }]
      })
      .slice(0, 20),
  }))

  expect(dimensions.scrollWidth, JSON.stringify(dimensions, null, 2)).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  )
}

async function expectControlsInsideViewport(page: Page) {
  const clippedControls = await page.locator(
    'a, button, textarea, input',
  ).evaluateAll((controls) => controls.flatMap((control) => {
    const style = getComputedStyle(control)
    if (style.display === 'none' || style.visibility === 'hidden') return []

    const bounds = control.getBoundingClientRect()
    if (bounds.width === 0 || bounds.height === 0) return []
    if (bounds.right >= 0 && bounds.left <= innerWidth) {
      if (bounds.left < -1 || bounds.right > innerWidth + 1) {
        return [{
          name: control.getAttribute('aria-label') ?? control.textContent?.trim() ?? control.tagName,
          left: bounds.left,
          right: bounds.right,
          viewport: innerWidth,
        }]
      }
    }
    return []
  }))

  expect(clippedControls).toEqual([])
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

test('keeps the complete public flow intentional across required mobile widths', async ({ browser }) => {
  test.setTimeout(60_000)

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 360, height: 640 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
  ]) {
    const { context, page } = await openTouchPage(browser, viewport)
    const renderedOrder = await page.locator('main > section').evaluateAll((sections) =>
      sections.map((section) => section.id),
    )
    expect(renderedOrder).toEqual(publicSectionOrder)

    for (const sectionId of publicSectionOrder) {
      await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded()
      await expectNoHorizontalOverflow(page)
      await expectControlsInsideViewport(page)
    }

    await context.close()
  }
})

test('uses practical mobile tap targets and a zoom-safe current chat surface', async ({ browser }) => {
  const { context, page } = await openTouchPage(browser, { width: 390, height: 844 })

  const expectMinimumTarget = async (locator: ReturnType<Page['locator']>) => {
    await expect.poll(async () => (await locator.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(43.5)
  }

  await expectMinimumTarget(page.locator('.menu-toggle'))
  await expectMinimumTarget(page.getByRole('link', { name: 'Explore My Work' }))
  await expectMinimumTarget(page.getByRole('button', { name: 'Ask My AI' }))

  await page.locator('.menu-toggle').click()
  await expectMinimumTarget(
    page.locator('#mobile-navigation').getByRole('link', { name: 'Stack' }),
  )
  await page.keyboard.press('Escape')

  await page.locator('#stack').scrollIntoViewIfNeeded()
  const languages = page
    .locator('[data-testid="engineering-mobile-map"]')
    .getByRole('button', { name: /Languages/ })
  await expectMinimumTarget(languages)
  await languages.click()
  await expectMinimumTarget(
    page.locator('[data-testid="engineering-mobile-map"]')
      .getByRole('button', { name: 'Java', exact: true }),
  )

  await page.locator('#selected-work').scrollIntoViewIfNeeded()
  const barberSpot = page.locator('[data-project-id="barberspot"]')
  await expectMinimumTarget(barberSpot.getByRole('button', { name: 'Inspect details' }))
  await expectMinimumTarget(barberSpot.getByRole('link', { name: /View BarberSpot/ }))

  await page.locator('#ai').scrollIntoViewIfNeeded()
  await expectMinimumTarget(page.locator('#ai .ai-suggestion-chip').first())
  await expectMinimumTarget(page.locator('.chat-fab'))
  await page.locator('.chat-fab').click()
  await expect(page.locator('.chat-panel')).toBeInViewport()
  await expectMinimumTarget(page.locator('.chat-close'))
  await expectMinimumTarget(page.locator('.chat-panel .chat-send'))
  await expect(page.locator('.chat-panel .chat-input')).toHaveCSS('font-size', '16px')
  await page.keyboard.press('Escape')
  await expect(page.locator('.chat-panel')).toBeHidden()
  await expect(page.locator('.chat-fab')).toBeFocused()

  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expectMinimumTarget(page.locator('#contact a').first())
  await expectNoHorizontalOverflow(page)
  await context.close()
})

test('survives short landscape and portrait resize without stale mobile state', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 })
  await page.goto('/#work')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.hero-planify-story')).toHaveAttribute(
    'data-transition-mode',
    'simplified',
  )
  await expectNoHorizontalOverflow(page)

  await page.setViewportSize({ width: 375, height: 667 })
  await expectNoHorizontalOverflow(page)
  await expect(page.locator('#work')).toBeVisible()
  await page.setViewportSize({ width: 667, height: 375 })
  await expectNoHorizontalOverflow(page)
})

test('captures final mobile Hero, Planify, map, work, navigation, AI, and tablet evidence', async ({ browser }) => {
  test.setTimeout(90_000)
  await mkdir(artifactDirectory, { recursive: true })

  const minimum = await openTouchPage(browser, { width: 320, height: 568 })
  await expect(minimum.page.locator('.chat-fab')).toHaveClass(/chat-fab--deferred/)
  await minimum.page.locator('#top').screenshot({
    path: resolve(artifactDirectory, '01-320-hero.png'),
    animations: 'disabled',
  })
  await minimum.context.close()

  const standard = await openTouchPage(browser, { width: 390, height: 844 })
  await standard.page.locator('.menu-toggle').click()
  await standard.page.screenshot({
    path: resolve(artifactDirectory, '02-390-mobile-navigation.png'),
    animations: 'disabled',
  })
  await standard.page.keyboard.press('Escape')
  await standard.page.addStyleTag({
    content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
  })
  await standard.page.locator('#work').screenshot({
    path: resolve(artifactDirectory, '03-390-planify.png'),
    animations: 'disabled',
  })
  const mobileSystem = standard.page.locator('[data-testid="engineering-mobile-map"]')
  await mobileSystem.getByRole('button', { name: /Languages/ }).click()
  await standard.page.locator('#stack').screenshot({
    path: resolve(artifactDirectory, '04-390-engineering-system.png'),
    animations: 'disabled',
  })
  for (const reveal of await standard.page.locator('#selected-work [data-selected-reveal]').all()) {
    await reveal.scrollIntoViewIfNeeded()
    await expect(reveal).toHaveAttribute('data-revealed', 'true')
  }
  await standard.page.locator('#selected-work').screenshot({
    path: resolve(artifactDirectory, '05-390-selected-work.png'),
    animations: 'disabled',
  })
  await standard.context.close()

  const large = await openTouchPage(browser, { width: 430, height: 932 })
  await large.page.addStyleTag({
    content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
  })
  await large.page.locator('#ai').screenshot({
    path: resolve(artifactDirectory, '06-430-ai.png'),
    animations: 'disabled',
  })
  await large.page.locator('#contact').screenshot({
    path: resolve(artifactDirectory, '07-430-contact.png'),
    animations: 'disabled',
  })
  await large.context.close()

  const tablet = await openTouchPage(browser, { width: 768, height: 1024 })
  await tablet.page.addStyleTag({
    content: '.site-header, .chat-widget, .skip-link { display: none !important; }',
  })
  await tablet.page.locator('#stack').screenshot({
    path: resolve(artifactDirectory, '08-768-engineering-system.png'),
    animations: 'disabled',
  })
  for (const reveal of await tablet.page.locator('#selected-work [data-selected-reveal]').all()) {
    await reveal.scrollIntoViewIfNeeded()
    await expect(reveal).toHaveAttribute('data-revealed', 'true')
  }
  await tablet.page.locator('#selected-work').screenshot({
    path: resolve(artifactDirectory, '09-768-selected-work.png'),
    animations: 'disabled',
  })
  await tablet.context.close()

  const landscape = await openTouchPage(browser, { width: 667, height: 375 })
  await landscape.page.locator('#work').scrollIntoViewIfNeeded()
  await landscape.page.screenshot({
    path: resolve(artifactDirectory, '10-short-landscape-planify.png'),
    animations: 'disabled',
  })
  await landscape.context.close()
})
