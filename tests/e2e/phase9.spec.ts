import { expect, test, type Browser, type Page } from '@playwright/test'
import { portfolio } from '../../shared/portfolio.ts'

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

const mobileWidths = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
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
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
        }]
      })
      .slice(0, 12),
  }))

  expect(dimensions.scrollWidth, JSON.stringify(dimensions, null, 2)).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  )
}

async function expectMinimumTarget(locator: ReturnType<Page['locator']>) {
  await expect
    .poll(async () => (await locator.boundingBox())?.height ?? 0)
    .toBeGreaterThanOrEqual(43.5)
}

/**
 * The floating assistant launcher is fixed above the page. The closing flow is
 * only usable if it never lands on a contact action or a footer control.
 */
async function expectNoLauncherCollision(page: Page) {
  const overlaps = await page.evaluate(() => {
    const launcher = document.querySelector('.chat-fab')
    if (!launcher) return []

    const fab = launcher.getBoundingClientRect()
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('#contact a, .site-footer a'),
    )

    return targets.flatMap((target) => {
      const bounds = target.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return []
      if (bounds.bottom < 0 || bounds.top > innerHeight) return []

      const intersects = bounds.left < fab.right
        && bounds.right > fab.left
        && bounds.top < fab.bottom
        && bounds.bottom > fab.top

      return intersects
        ? [{ label: target.textContent?.trim().slice(0, 40) ?? target.tagName }]
        : []
    })
  })

  expect(overlaps).toEqual([])
}

async function openTouchPage(browser: Browser, viewport: { width: number; height: number }) {
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

test('publishes the audited title, description, and social metadata', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(portfolio.metadata.title)

  const head = await page.evaluate(() => document.head.innerHTML)
  expect(head).not.toMatch(/__PORTFOLIO_[A-Z_]+__/)

  const metaContent = async (selector: string) =>
    page.locator(selector).first().getAttribute('content')

  expect(await metaContent('meta[name="description"]')).toBe(portfolio.metadata.description)
  expect(await metaContent('meta[property="og:type"]')).toBe('website')
  expect(await metaContent('meta[property="og:site_name"]')).toBe(portfolio.metadata.siteName)
  expect(await metaContent('meta[property="og:title"]')).toBe(portfolio.metadata.title)
  expect(await metaContent('meta[property="og:description"]')).toBe(
    portfolio.metadata.description,
  )
  expect(await metaContent('meta[name="twitter:title"]')).toBe(portfolio.metadata.title)
  expect(await metaContent('meta[name="twitter:description"]')).toBe(
    portfolio.metadata.description,
  )
  // No image is published, so the card must not claim a large-image preview.
  expect(await metaContent('meta[name="twitter:card"]')).toBe('summary')
})

test('omits every field that depends on an unconfirmed canonical domain', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0)
  // An absolute image URL is unavailable, so no image field is published and no
  // root-relative stand-in is used.
  await expect(page.locator('meta[property^="og:image"]')).toHaveCount(0)
  await expect(page.locator('meta[name^="twitter:image"]')).toHaveCount(0)
  await expect(page.locator('meta[name="twitter:card"]')).not.toHaveAttribute(
    'content',
    'summary_large_image',
  )
  // JSON-LD stays out while its URL and sameAs inputs are unapproved.
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0)

  // Current state, not a permanent rule: the canonical domain is still
  // unresolved, so this is null and nothing URL-dependent is emitted.
  expect(portfolio.metadata.canonicalUrl).toBeNull()

  // No deployment host stands in for the canonical address.
  const head = await page.evaluate(() => document.head.innerHTML)
  expect(head).not.toMatch(/vercel\.app|github\.io|https?:\/\//)
})

test('serves the favicon set', async ({ page, request }) => {
  await page.goto('/')

  const iconHrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))

  expect(iconHrefs).toContain('/favicon-fh.svg')
  expect(iconHrefs.length).toBeGreaterThanOrEqual(2)

  for (const href of iconHrefs) {
    const response = await request.get(href as string)
    expect(response.status(), `${href} must be served`).toBe(200)
  }
})

test('keeps the social card prepared as a static asset without publishing it', async ({ request }) => {
  const response = await request.get(portfolio.metadata.socialImagePath)
  expect(response.status(), 'the prepared social card stays available').toBe(200)
})

test('keeps a useful no-JavaScript fallback with the public channels', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    javaScriptEnabled: false,
  })
  const page = await context.newPage()
  await page.goto('/')

  const fallback = page.locator('.no-js-fallback')
  await expect(fallback).toBeVisible()
  // The empty app root must not push the fallback below the fold.
  await expect(fallback).toBeInViewport()
  await expect(fallback).toContainText(portfolio.identity.heroStatement)
  await expect(fallback.getByRole('link', { name: 'francihoxha@yahoo.com' })).toBeVisible()
  await expect(fallback.getByRole('link', { name: 'Download the PDF CV' })).toHaveAttribute(
    'href',
    '/Franci-Hoxha-CV.pdf',
  )
  await expect(fallback.locator('a[href^="tel:"]')).toHaveCount(0)
  await expect(fallback).not.toContainText('+355')

  await context.close()
})

test('closes the public flow with contact and then the footer', async ({ page }) => {
  await page.goto('/')

  const renderedOrder = await page.locator('main > section').evaluateAll((sections) =>
    sections.map((section) => section.id),
  )
  expect(renderedOrder).toEqual(publicSectionOrder)

  const contact = page.locator('#contact')
  await contact.scrollIntoViewIfNeeded()
  await expect(contact.getByRole('heading', { level: 2 })).toHaveText(
    portfolio.contactNarrative.title,
  )
  await expect(contact.getByRole('link', { name: 'Email me' })).toHaveAttribute(
    'href',
    'mailto:francihoxha@yahoo.com',
  )
  await expect(contact.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
    'href',
    '/Franci-Hoxha-CV.pdf',
  )
  await expect(contact.getByRole('link', { name: 'View profile' })).toHaveAttribute(
    'target',
    '_blank',
  )

  const footer = page.getByRole('contentinfo')
  await expect(footer).toBeVisible()
  await expect(
    footer.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link'),
  ).toHaveCount(portfolio.navigation.filter((item) => item.status === 'published').length)

  await footer.getByRole('link', { name: /back to the top/i }).click()
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(40)
})

test('publishes no phone number and no availability or response-time claim', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)

  const text = await page.locator('body').innerText()
  expect(text).not.toMatch(/\+355/)
  expect(text).not.toMatch(/usually replies|response time/i)
  expect(text).not.toMatch(/junior full-stack|currently pursuing/i)
})

test('keeps the closing flow usable across the required widths', async ({ browser }) => {
  test.setTimeout(90_000)

  for (const viewport of mobileWidths) {
    const { context, page } = await openTouchPage(browser, viewport)

    for (const sectionId of ['ai', 'contact']) {
      await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded()
      await expectNoHorizontalOverflow(page)
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expectNoHorizontalOverflow(page)
    await expectNoLauncherCollision(page)

    await expect(page.getByRole('contentinfo')).toBeInViewport()
    await expectMinimumTarget(page.locator('#contact a').first())
    await expectMinimumTarget(page.getByRole('contentinfo').getByRole('link').first())

    await context.close()
  }
})

test('keeps the closing flow usable in short landscape', async ({ browser }) => {
  const { context, page } = await openTouchPage(browser, { width: 667, height: 375 })

  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expectNoHorizontalOverflow(page)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expectNoLauncherCollision(page)
  await expect(page.getByRole('contentinfo')).toBeInViewport()

  await context.close()
})

test('reflows the closing flow at 200% zoom', async ({ page }) => {
  // Browser zoom halves the CSS viewport and re-evaluates media queries, which
  // a root `zoom` style does not. Halving the viewport is the faithful check.
  await page.setViewportSize({ width: 640, height: 450 })
  await page.goto('/')

  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(page.locator('#contact').getByRole('heading', { level: 2 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Email me' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})
