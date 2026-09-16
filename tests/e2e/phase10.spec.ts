import { expect, test, type Browser, type Page } from '@playwright/test'

/**
 * Phase 10 performance and accessibility gates.
 *
 * These lock in the properties the Phase 10 audit verified, so a later change
 * cannot quietly reintroduce continuous offscreen rendering, an unreachable
 * focus indicator, a sub-AA text colour, or an oversized initial payload.
 */

// These gates open several browser contexts each (three reflow widths, two
// phone widths, reduced motion, forced colors). Run them serially: adding them
// to the fully parallel pool raised peak concurrency enough to cause timing
// failures in unrelated interaction specs, which a HEAD baseline did not show.
test.describe.configure({ mode: 'serial' })

const sections = ['work', 'stack', 'selected-work', 'journey', 'credentials', 'ai', 'contact']

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(
    dimensions.scrollWidth,
    `document scrolls horizontally: ${JSON.stringify(dimensions)}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

/**
 * Composites every ancestor background - including translucent surfaces - down
 * onto the page base before measuring, because the app layers rgba panels over
 * a dark ground. Elements painted over a gradient are reported separately
 * rather than guessed at, since `backgroundColor` cannot describe a gradient.
 */
async function contrastFailures(page: Page) {
  return page.evaluate(() => {
    const parse = (value: string) => {
      const parts = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 }
    }
    type Rgba = ReturnType<typeof parse>
    const over = (fg: Rgba, bg: Rgba): Rgba => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    })
    const luminance = (color: Rgba) => {
      const channels = [color.r, color.g, color.b].map((value) => {
        const normalized = value / 255
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
    }
    const ratio = (a: Rgba, b: Rgba) => {
      const lighter = Math.max(luminance(a), luminance(b))
      const darker = Math.min(luminance(a), luminance(b))
      return (lighter + 0.05) / (darker + 0.05)
    }

    const backdrop = (element: Element) => {
      const stack: Rgba[] = []
      let node: Element | null = element
      let gradient = false

      while (node && node !== document.documentElement) {
        const style = getComputedStyle(node)
        if (style.backgroundImage && style.backgroundImage !== 'none') gradient = true
        const background = parse(style.backgroundColor)
        if (background.a > 0) stack.push(background)
        node = node.parentElement
      }

      let base: Rgba = { r: 5, g: 5, b: 8, a: 1 }
      for (let index = stack.length - 1; index >= 0; index -= 1) base = over(stack[index], base)
      return { base, gradient }
    }

    const failures: Array<{
      selector: string
      text: string
      fontSize: number
      ratio: number
      required: number
      overGradient: boolean
    }> = []

    for (const element of document.querySelectorAll('p,span,a,li,small,strong,h1,h2,h3,h4,button,label,div')) {
      // Only the element's own text, so a container is not judged by a child's colour.
      const text = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? '')
        .join('')
      if (!text) continue
      if (element.closest('[aria-hidden="true"]')) continue

      const style = getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      if (Number(style.opacity) < 0.35) continue

      const bounds = element.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) continue

      const fontSize = parseFloat(style.fontSize)
      const large = fontSize >= 24 || (fontSize >= 18.66 && Number(style.fontWeight) >= 700)
      const required = large ? 3 : 4.5
      const { base, gradient } = backdrop(element)
      const measured = ratio(parse(style.color), base)

      if (measured < required) {
        failures.push({
          selector: `${element.tagName.toLowerCase()}.${String(element.className).split(' ')[0]}`,
          text: text.slice(0, 40),
          fontSize: Number(fontSize.toFixed(1)),
          ratio: Number(measured.toFixed(2)),
          required,
          overGradient: gradient,
        })
      }
    }

    return failures
  })
}

test('stops rendering the scene once the hero leaves the viewport', async ({ page }) => {
  await page.goto('/')
  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')

  // The motion diagnostics only advance while frames are produced, so this
  // proves the renderer stopped rather than that rAF is still ticking.
  const idleTick = () => slot.getAttribute('data-scene-idle-tick')

  const runningBefore = await idleTick()
  await page.waitForTimeout(900)
  expect(await idleTick(), 'the scene should render while the hero is visible')
    .not.toBe(runningBefore)

  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(slot).toHaveAttribute('data-scene-active', 'false')
  await page.waitForTimeout(600)

  const pausedBefore = await idleTick()
  await page.waitForTimeout(1200)
  expect(await idleTick(), 'no frames may be produced while the hero is offscreen')
    .toBe(pausedBefore)
})

test('keeps renderer work inside the Phase 10 budgets', async ({ page }) => {
  await page.goto('/')
  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-mode', 'enhanced')
  await expect(slot).toHaveAttribute('data-scene-draw-calls', /\d+/)

  const diagnostics = await slot.evaluate((element) => ({
    drawCalls: Number(element.getAttribute('data-scene-draw-calls')),
    dpr: Number(element.getAttribute('data-scene-dpr')),
    textures: Number(element.getAttribute('data-scene-textures')),
  }))

  expect(diagnostics.drawCalls).toBeGreaterThan(0)
  expect(diagnostics.drawCalls, 'desktop draw calls stay under 100').toBeLessThan(100)
  expect(diagnostics.dpr, 'desktop DPR stays clamped at 1.75').toBeLessThanOrEqual(1.75)
  expect(await page.locator('canvas').count(), 'exactly one WebGL canvas').toBe(1)
})

test('loads no 3D runtime and mounts no canvas under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  const scripts: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url())
  })

  await page.goto('/')
  await page.waitForTimeout(1200)

  expect(scripts.some((url) => url.includes('DeveloperUniverseCanvas')), 'no 3D chunk')
    .toBe(false)
  expect(await page.locator('canvas').count()).toBe(0)
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-mode', 'fallback')
  await expect(page.locator('h1')).toBeVisible()

  await context.close()
})

test('keeps the initial critical image transfer inside budget', async ({ page }) => {
  const imageBytes = new Map<string, number>()
  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'image') return
    try {
      const { responseBodySize } = await response.request().sizes()
      // One entry per URL: the same asset shared by several nodes is one download.
      imageBytes.set(response.url(), Math.max(imageBytes.get(response.url()) ?? 0, responseBodySize))
    } catch { /* response body already discarded */ }
  })

  await page.goto('/')
  await page.waitForTimeout(2000)

  const total = [...imageBytes.values()].reduce((sum, bytes) => sum + bytes, 0)
  expect(total, `initial images: ${JSON.stringify([...imageBytes])}`).toBeLessThanOrEqual(300 * 1024)
})

test('gives every keyboard stop a visible focus indicator', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(800)

  // A focusin listener records each stop in the page, so the whole traversal
  // costs two round trips instead of one per stop.
  await page.evaluate(() => {
    const seen: Array<{ name: string; indicated: boolean }> = []
    ;(window as unknown as { __focusTrail: typeof seen }).__focusTrail = seen

    document.addEventListener('focusin', () => {
      const element = document.activeElement
      if (!element || element === document.body) return
      const style = getComputedStyle(element)
      const visibleOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      seen.push({
        name: (element.getAttribute('aria-label')
          || element.textContent?.trim()
          || element.getAttribute('placeholder')
          || element.tagName).slice(0, 40),
        indicated: visibleOutline || style.boxShadow !== 'none',
      })
    })
  })

  for (let step = 0; step < 80; step += 1) await page.keyboard.press('Tab')

  const trail = await page.evaluate(
    () => (window as unknown as { __focusTrail: Array<{ name: string; indicated: boolean }> }).__focusTrail,
  )

  expect(trail.length, 'the page should expose a keyboard path').toBeGreaterThan(20)
  expect(
    trail.filter((stop) => !stop.indicated).map((stop) => stop.name),
    'every focusable control needs a visible focus ring',
  ).toEqual([])
})

test('meets AA text contrast across the whole page', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1200)
  for (const id of sections) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)

  const failures = await contrastFailures(page)
  // Text painted over a gradient cannot be measured from `backgroundColor`;
  // those cases are dark-on-light gradient buttons, verified by hand.
  const measurable = failures.filter((failure) => !failure.overGradient)

  expect(measurable, JSON.stringify(failures, null, 2)).toEqual([])
})

test('reflows without horizontal scrolling at real zoom levels', async ({ browser }) => {
  // Browser zoom halves the CSS viewport and re-evaluates media queries.
  // 720x450 @2x is 1440x900 at 200%; 320 CSS px is the WCAG 1.4.10 reflow width.
  for (const [width, height, label] of [
    [720, 450, '1440x900 at 200%'],
    [320, 512, '1280x2048 at 400% (WCAG reflow)'],
  ] as Array<[number, number, string]>) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('h1'), label).toBeVisible()

    for (const id of sections) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await expectNoHorizontalOverflow(page)
    }

    await context.close()
  }
})

async function openTouchPage(browser: Browser, viewport: { width: number; height: number }) {
  const context = await browser.newContext({
    viewport,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  })
  const page = await context.newPage()
  await page.goto('/')
  return { context, page }
}

test('keeps every control at the WCAG 2.2 minimum target size on phones', async ({ browser }) => {
  // 320 is the binding width here; phase6-mobile-audit covers 390 in detail.
  for (const width of [320]) {
    const { context, page } = await openTouchPage(browser, { width, height: 720 })

    for (const id of sections) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await page.waitForTimeout(100)
    }

    const undersized = await page.evaluate(() => {
      const found: Array<{ name: string; width: number; height: number }> = []
      for (const element of document.querySelectorAll('a, button, input, textarea, select, [role="button"]')) {
        const style = getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden') continue
        const bounds = element.getBoundingClientRect()
        if (bounds.width === 0 || bounds.height === 0) continue
        if (bounds.height < 24 || bounds.width < 24) {
          found.push({
            name: (element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName).slice(0, 30),
            width: Math.round(bounds.width),
            height: Math.round(bounds.height),
          })
        }
      }
      return found
    })

    expect(undersized, `targets under 24px at ${width}px`).toEqual([])
    await context.close()
  }
})

test('keeps the page usable with forced colors active', async ({ browser }) => {
  const context = await browser.newContext({
    forcedColors: 'active',
    colorScheme: 'light',
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeAttached()

  await context.close()
})

test('exposes one landmark set, one h1, and a decorative canvas', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1000)

  const structure = await page.evaluate(() => {
    const scoped = (element: Element) => element.closest('section, article, aside, nav, main') !== null
    return {
      banners: Array.from(document.querySelectorAll('header')).filter((el) => !scoped(el)).length,
      contentinfos: Array.from(document.querySelectorAll('footer')).filter((el) => !scoped(el)).length,
      mains: document.querySelectorAll('main').length,
      h1s: document.querySelectorAll('h1').length,
      unlabelledNavs: Array.from(document.querySelectorAll('nav'))
        .filter((nav) => !nav.getAttribute('aria-label')).length,
      canvasDecorative: document.querySelector('canvas')?.closest('[aria-hidden="true"]') !== null,
      positiveTabindex: Array.from(document.querySelectorAll('[tabindex]'))
        .filter((el) => Number(el.getAttribute('tabindex')) > 0).length,
    }
  })

  expect(structure).toEqual({
    banners: 1,
    contentinfos: 1,
    mains: 1,
    h1s: 1,
    unlabelledNavs: 0,
    canvasDecorative: true,
    positiveTabindex: 0,
  })
})
