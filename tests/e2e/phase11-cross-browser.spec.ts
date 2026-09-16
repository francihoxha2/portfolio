import { expect, test, type Browser, type Page } from '@playwright/test'

/**
 * Phase 11 cross-browser / cross-device QA.
 *
 * This is the only spec `playwright.config.ts` runs in more than one engine:
 * the `firefox`, `webkit`, and `edge` projects match this file alone, while the
 * accepted `chrome` project keeps running the whole suite. Everything here is
 * therefore written to engine-portable APIs only.
 *
 * Deliberately avoided, because they are not available in every engine and a
 * Phase 11 gate must not fail for a tooling reason:
 * - `isMobile` (Chromium/WebKit only - Firefox rejects the context option), so
 *   coarse-pointer cases use `viewport` + `hasTouch`.
 * - `emulateMedia({ forcedColors })` (Chromium only) - Phase 10 already gates
 *   forced colors in `phase10.spec.ts` under the `chrome` project.
 * - CDP network throttling - slow-network behaviour is driven with `page.route`
 *   delays, matching the existing Phase 8 mock convention.
 */

// Phase 10 recorded that context-heavy gates destabilise the fully parallel
// pool. This file opens a context per viewport, so it runs serially; the four
// engine projects still fill the four accepted workers.
test.describe.configure({ mode: 'serial' })

const baseURL = 'http://127.0.0.1:4173'

const sectionIds = ['work', 'stack', 'selected-work', 'journey', 'credentials', 'ai', 'contact']

const deviceMatrix = [
  { label: '320x568 minimum phone', width: 320, height: 568, touch: true },
  { label: '360x740 small phone', width: 360, height: 740, touch: true },
  { label: '375x667 phone', width: 375, height: 667, touch: true },
  { label: '390x844 phone', width: 390, height: 844, touch: true },
  { label: '430x932 large phone', width: 430, height: 932, touch: true },
  { label: '768x1024 tablet portrait', width: 768, height: 1024, touch: true },
  { label: '1024x768 tablet landscape', width: 1024, height: 768, touch: true },
  { label: '740x360 short landscape', width: 740, height: 360, touch: true },
  { label: '1280x720 short laptop', width: 1280, height: 720, touch: false },
  { label: '1440x900 desktop', width: 1440, height: 900, touch: false },
]

type Viewport = { width: number; height: number }

async function openContext(
  browser: Browser,
  viewport: Viewport,
  options: { touch?: boolean; reducedMotion?: 'reduce' | 'no-preference' } = {},
) {
  const context = await browser.newContext({
    baseURL,
    colorScheme: 'dark',
    viewport,
    hasTouch: options.touch ?? false,
    reducedMotion: options.reducedMotion ?? 'no-preference',
  })
  const page = await context.newPage()
  return { context, page }
}

/**
 * `scroll-behavior: smooth` is global (src/index.css), so a programmatic
 * `scrollTo` animates, and the animation lasts measurably longer in Gecko and
 * WebKit than in Chromium. Anything that measures geometry after scrolling has
 * to wait for the offset to stop changing or it reads a mid-flight layout.
 */
async function settleScroll(page: Page) {
  await page.waitForFunction(
    () => {
      const tracker = window as unknown as { __lastY?: number; __stableFrames?: number }
      const current = Math.round(window.scrollY)
      tracker.__stableFrames = tracker.__lastY === current ? (tracker.__stableFrames ?? 0) + 1 : 0
      tracker.__lastY = current
      return (tracker.__stableFrames ?? 0) >= 3
    },
    undefined,
    { timeout: 15_000, polling: 100 },
  )
}

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(
    dimensions.scrollWidth,
    `${label} scrolls horizontally: ${JSON.stringify(dimensions)}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

/** The hero must always resolve to a declared tier, whatever the engine can do. */
async function sceneContract(page: Page) {
  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-tier', /full|reduced|static/)
  return {
    tier: await slot.getAttribute('data-scene-tier'),
    reason: await slot.getAttribute('data-scene-reason'),
    canvases: await page.locator('canvas').count(),
  }
}

async function installMockAssistant(
  page: Page,
  options: { delayMs?: number; status?: number; abort?: boolean; failTimes?: number } = {},
) {
  const state = { requests: 0 }
  await page.route('**/api/chat', async (route) => {
    state.requests += 1
    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs))
    }

    const shouldFail =
      options.failTimes === undefined ? true : state.requests <= options.failTimes

    if (options.abort && shouldFail) {
      await route.abort('connectionfailed')
      return
    }
    if (options.status && shouldFail) {
      await route.fulfill({
        status: options.status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'mocked failure' }),
      })
      return
    }

    const payload = route.request().postDataJSON()
    const question = payload.messages.at(-1).content
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: `Mock answer for: ${question}` }),
    })
  })
  return state
}

test('renders the complete journey end to end', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1440, height: 900 })
  await page.goto('/')

  await expect(page.locator('h1')).toHaveText(
    'Building modern software experiences, from idea to production.',
  )
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()

  for (const id of sectionIds) {
    const section = page.locator(`#${id}`)
    await section.scrollIntoViewIfNeeded()
    await expect(section, `#${id} is missing`).toBeVisible()
    await expect(section.getByRole('heading').first()).toBeVisible()
  }

  await expect(page.locator('#journey .journey-stage')).toHaveCount(4)
  await expect(page.locator('#credentials .credential-item')).toHaveCount(3)
  await expect(page.locator('#contact').getByRole('link', { name: 'Email me' })).toHaveAttribute(
    'href',
    /^mailto:/,
  )

  const footer = page.getByRole('contentinfo')
  await footer.scrollIntoViewIfNeeded()
  await expect(footer).toBeVisible()
  await footer.getByRole('link', { name: /back to the top/i }).click()
  await expect(page.locator('h1')).toBeInViewport()

  await expectNoHorizontalOverflow(page, 'desktop journey')
  await context.close()
})

test('resolves the hero scene to a supported tier with one canvas at most', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1440, height: 900 })
  await page.goto('/')

  const contract = await sceneContract(page)
  expect(contract.canvases, 'more than one R3F canvas').toBeLessThanOrEqual(1)
  if (contract.tier === 'static') {
    expect(contract.canvases).toBe(0)
    await expect(page.locator('.hero-fallback')).toBeVisible()
  }

  // Whatever the tier, the DOM hero carries the meaning.
  await expect(page.getByText('Web • Mobile • Backend • AI', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Download CV' }).first()).toBeVisible()
  await context.close()
})

test('survives the Hero-to-Planify transition forward and in reverse', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()

  const canvasesAtRest = await page.locator('canvas').count()
  expect(canvasesAtRest).toBeLessThanOrEqual(1)

  await page.locator('#work').scrollIntoViewIfNeeded()
  await settleScroll(page)
  await expect(page.locator('#work')).toBeVisible()
  expect(await page.locator('canvas').count()).toBeLessThanOrEqual(1)

  await page.locator('#selected-work').scrollIntoViewIfNeeded()
  await settleScroll(page)

  // Reverse. The smooth-scroll animation from the forward pass has to finish
  // first: a programmatic jump issued while it is still in flight is overtaken
  // by the animation, which lands the page back down the document.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }))
  await settleScroll(page)
  await expect(page.locator('h1')).toBeInViewport()

  // Reversing must not leave a second canvas or tear the scene down.
  expect(await page.locator('canvas').count()).toBeLessThanOrEqual(1)
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-tier', /full|reduced|static/)
  await expectNoHorizontalOverflow(page, 'after reverse transition')
  await context.close()
})

/**
 * The whole width matrix runs inside one context per input mode rather than one
 * context per width. Phase 10 recorded that the fix for a saturated worker pool
 * is to make the gates cheaper before touching the accepted worker count; with
 * four engine projects, a context per width meant forty browser contexts per
 * run and intermittent timing failures in unrelated specs. Coverage is
 * unchanged - every width still gets a fresh document and the same assertions.
 */
async function runLayoutMatrix(
  browser: Browser,
  devices: typeof deviceMatrix,
  touch: boolean,
) {
  const { context, page } = await openContext(
    browser,
    { width: devices[0].width, height: devices[0].height },
    { touch },
  )

  for (const device of devices) {
    await page.setViewportSize({ width: device.width, height: device.height })
    await page.goto('/')
    await expect(page.locator('h1'), `h1 missing at ${device.label}`).toBeVisible()
    await expectNoHorizontalOverflow(page, `${device.label} at load`)

    for (const id of sectionIds) {
      const section = page.locator(`#${id}`)
      await section.scrollIntoViewIfNeeded()
      await expect(section, `#${id} missing at ${device.label}`).toBeVisible()
    }

    await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
    await expect(
      page.getByRole('contentinfo'),
      `footer unreachable at ${device.label}`,
    ).toBeInViewport()
    await expectNoHorizontalOverflow(page, `${device.label} at footer`)
  }

  await context.close()
}

test('keeps the layout usable across touch device widths', async ({ browser }) => {
  await runLayoutMatrix(browser, deviceMatrix.filter((device) => device.touch), true)
})

test('keeps the layout usable across pointer device widths', async ({ browser }) => {
  await runLayoutMatrix(browser, deviceMatrix.filter((device) => !device.touch), false)
})

/**
 * Phase 11 corrective gate: mid-transition Hero continuity in simplified mode.
 *
 * A real iPhone Safari pass found the Hero visual vanishing part-way through
 * the Hero-to-Planify scroll, leaving a blank band before Planify entered.
 * Cause: the `--planify-source-release` rules released the source all the way
 * to zero in every enhanced mode, but the handoff frame and the Planify reveal
 * that receive it are cinematic-only, so simplified had nothing to hand over
 * to. The gate asserts the user outcome rather than a specific opacity: while
 * the scene slot is still on screen and Planify has not yet arrived, whichever
 * visual is active - the live scene layer, or the static fallback - must stay
 * perceptible.
 */
const continuityWidths = [320, 375, 390, 430]

// Deliberately well below the 0.64 the fix produces. The gate fails hard on a
// blank band without pinning the design to an exact value.
const heroVisualFloor = 0.25

async function heroContinuityViolations(page: Page, label: string) {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('A viewport is required for the continuity walk.')

  const violations: string[] = []
  const step = Math.max(40, Math.round(viewport.height / 8))

  for (let top = 0; top <= viewport.height * 1.6; top += step) {
    // Land the scroll and let ScrollTrigger's scrub apply before sampling. A
    // fixed delay was not enough under a loaded worker pool.
    await page.evaluate(async (y) => {
      window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      )
    }, top)
    await page.waitForTimeout(60)

    const sample = await page.evaluate(() => {
      const story = document.querySelector<HTMLElement>('.hero-planify-story')
      const slot = document.querySelector<HTMLElement>('.hero-scene-slot')
      const planify = document.querySelector<HTMLElement>('[data-planify-browser]')
      const inView = (element: Element | null) => {
        if (!element) return false
        const bounds = element.getBoundingClientRect()
        return bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.height > 0
      }

      // Whichever layer is currently carrying the Hero visual.
      const ready = slot?.classList.contains('hero-scene-slot--ready') ?? false
      const active = ready
        ? document.querySelector<HTMLElement>('.hero-scene-layer')
        : document.querySelector<HTMLElement>('.hero-fallback')

      return {
        progress: Number(story?.dataset.transitionProgress ?? 0),
        mode: story?.dataset.transitionMode ?? '',
        ready,
        opacity: active ? Number.parseFloat(getComputedStyle(active).opacity) : 0,
        slotInView: inView(slot),
        planifyInView: inView(planify),
      }
    })

    // Only meaningful while the Hero still owns the screen.
    if (!sample.slotInView || sample.planifyInView) continue
    if (sample.opacity < heroVisualFloor) {
      violations.push(
        `${label} scrollY=${top} progress=${sample.progress.toFixed(3)} ` +
          `${sample.ready ? 'scene-layer' : 'fallback'} opacity=${sample.opacity}`,
      )
    }
  }

  return violations
}

test('keeps the Hero visual continuous through the simplified transition', async ({ browser }) => {
  const { context, page } = await openContext(
    browser,
    { width: continuityWidths[0], height: 844 },
    { touch: true },
  )

  for (const width of continuityWidths) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    const story = page.locator('.hero-planify-story')
    await expect(story).toHaveAttribute('data-transition-module', 'ready')
    await expect(story, `${width}px should use the simplified path`).toHaveAttribute(
      'data-transition-mode',
      'simplified',
    )
    // Measure the live-scene path deterministically, as the accepted Phase 4
    // spec does, rather than racing the deferred canvas mount.
    await expect(page.locator('.hero-scene-slot')).toHaveAttribute(
      'data-scene-mode',
      'enhanced',
      { timeout: 15_000 },
    )

    const violations = await heroContinuityViolations(page, `${width}px`)
    expect(
      violations,
      `Hero visual disappeared before Planify arrived: ${JSON.stringify(violations)}`,
    ).toEqual([])
  }

  await context.close()
})

test('keeps the static fallback continuous when WebGL is unavailable', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 390, height: 844 }, { touch: true })
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', { configurable: true, value: undefined })
  })
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-tier', 'static')
  await expect(slot).toHaveAttribute('data-scene-reason', 'webgl-unavailable')
  await expect(page.locator('.hero-planify-story')).toHaveAttribute(
    'data-transition-mode',
    'simplified',
  )

  const violations = await heroContinuityViolations(page, '390px static')
  expect(
    violations,
    `static fallback disappeared before Planify arrived: ${JSON.stringify(violations)}`,
  ).toEqual([])
  await context.close()
})

test('still releases the cinematic Hero fully into the handoff frame', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1440, height: 900 })
  await page.goto('/')

  const story = page.locator('.hero-planify-story')
  await expect(story).toHaveAttribute('data-transition-module', 'ready')
  await expect(story).toHaveAttribute('data-transition-mode', 'cinematic')
  await expect(page.locator('.hero-scene-slot')).toHaveAttribute('data-scene-mode', 'enhanced', {
    timeout: 15_000,
  })

  // Park inside the release window and confirm the desktop crossfade still sums
  // to one: the simplified floor must not have leaked into cinematic.
  const distance = Number(await story.getAttribute('data-transition-distance'))
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }),
    Math.round(distance * 0.56),
  )
  await settleScroll(page)

  const crossfade = await page.evaluate(() => ({
    release: Number(
      getComputedStyle(document.querySelector('.hero-planify-story')!).getPropertyValue(
        '--planify-source-release',
      ),
    ),
    scene: Number.parseFloat(
      getComputedStyle(document.querySelector('.hero-scene-layer')!).opacity,
    ),
    transfer: Number.parseFloat(
      getComputedStyle(document.querySelector('[data-planify-handoff-frame]')!).opacity,
    ),
  }))

  expect(crossfade.release, 'the release window was not reached').toBeGreaterThan(0.1)
  expect(crossfade.scene + crossfade.transfer).toBeCloseTo(1, 1)
  await context.close()
})

test('opens and closes the mobile menu under touch input', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 390, height: 844 }, { touch: true })
  await page.goto('/')

  const toggle = page.getByRole('button', { name: 'Open navigation menu' })
  await expect(toggle).toBeVisible()
  await toggle.tap()

  const menu = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(menu).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused()

  await expectNoHorizontalOverflow(page, 'mobile menu closed')
  await context.close()
})

test('meets the 44 px touch target floor on a 390 px phone', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 390, height: 844 }, { touch: true })
  await page.goto('/')

  const undersized = await page.evaluate(() => {
    const selectors = '.site-header button, .site-header a, #contact a, .site-footer a, .chat-fab'
    return Array.from(document.querySelectorAll<HTMLElement>(selectors))
      .map((element) => {
        const bounds = element.getBoundingClientRect()
        return {
          label: element.textContent?.trim().slice(0, 40) || element.getAttribute('aria-label') || element.className,
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        }
      })
      .filter((entry) => entry.width > 0 && entry.height > 0)
      .filter((entry) => entry.height < 43.5)
  })

  expect(undersized, `targets below 44 px: ${JSON.stringify(undersized)}`).toEqual([])
  await context.close()
})

test('keeps the floating assistant launcher clear of contact and footer actions', async ({
  browser,
}) => {
  const { context, page } = await openContext(browser, { width: 390, height: 844 }, { touch: true })
  await page.goto('/')
  // Match the accepted Phase 9 condition: the closing flow is evaluated at the
  // bottom of the page. A fixed launcher necessarily passes over some element
  // at intermediate scroll offsets; the accepted contract is that it never
  // rests on a contact or footer action.
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await settleScroll(page)

  const overlaps = await page.evaluate(() => {
    const launcher = document.querySelector('.chat-fab')
    if (!launcher) return []
    const fab = launcher.getBoundingClientRect()
    return Array.from(document.querySelectorAll<HTMLElement>('#contact a, .site-footer a'))
      .filter((target) => {
        const bounds = target.getBoundingClientRect()
        if (bounds.width === 0 || bounds.height === 0) return false
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) return false
        return (
          bounds.left < fab.right &&
          bounds.right > fab.left &&
          bounds.top < fab.bottom &&
          bounds.bottom > fab.top
        )
      })
      .map((target) => target.textContent?.trim().slice(0, 40) ?? '')
  })

  expect(overlaps, `launcher covers: ${JSON.stringify(overlaps)}`).toEqual([])
  await context.close()
})

/**
 * Whether the engine includes links in sequential focus navigation. WebKit
 * ships Safari's default "Press Tab to highlight each item" behaviour, where
 * Tab visits form controls and buttons but never `<a href>`. That is a platform
 * setting, not a page property, so the skip-link ordering gate is asserted only
 * where the engine can express it.
 */
async function linksAreTabbable(page: Page) {
  await page.keyboard.press('Tab')
  return page.evaluate(() => document.activeElement?.tagName === 'A')
}

test('exposes the skip link as the first tab stop', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  await page.goto('/')

  const tabbable = await linksAreTabbable(page)
  test.skip(
    !tabbable,
    'This engine excludes links from Tab order (Safari/WebKit default full keyboard access).',
  )

  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()

  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await context.close()
})

test('reaches the main content from the skip link in every engine', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  await page.goto('/')

  // Engine-independent: however the user gets to the skip link, activating it
  // must move focus into main content.
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await skipLink.focus()
  await expect(skipLink).toBeVisible()
  await skipLink.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await context.close()
})

test('shows a visible focus indicator at every keyboard stop', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  await page.goto('/')

  // Walk a bounded number of stops and confirm each focused control is both
  // visible and visually distinguishable from its unfocused state.
  const invisibleStops: string[] = []
  for (let stop = 0; stop < 25; stop += 1) {
    await page.keyboard.press('Tab')
    const detail = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      if (!active || active === document.body) return null
      const bounds = active.getBoundingClientRect()
      const style = getComputedStyle(active)
      return {
        label: active.getAttribute('aria-label') || active.textContent?.trim().slice(0, 40) || active.tagName,
        visible: bounds.width > 0 && bounds.height > 0,
        indicator:
          style.outlineStyle !== 'none' ||
          style.boxShadow !== 'none' ||
          style.borderStyle !== 'none',
      }
    })
    if (!detail) continue
    if (!detail.visible || !detail.indicator) invisibleStops.push(detail.label)
  }

  expect(invisibleStops, `stops without a usable focus state: ${JSON.stringify(invisibleStops)}`).toEqual(
    [],
  )
  await context.close()
})

test('contains and returns focus in the certificate viewer', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1440, height: 900 })
  await page.goto('/#credentials')

  const trigger = page.getByRole('button', { name: /^View certificate: / }).first()
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const close = dialog.getByRole('button', { name: 'Close certificate viewer' })
  await expect(close).toBeFocused()

  // While the viewer is modal, the keyboard must never reach an interactive
  // control outside it. The exact cycle differs by engine - Chromium keeps
  // every stop inside the dialog subtree, while WebKit also parks on the inert
  // <body> between passes - so the gate is the contract that matters: no
  // reachable interactive element outside the dialog.
  const escapes: string[] = []
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press('Tab')
    const leaked = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      // The viewer is a native <dialog>; its dialog role is implicit, so a
      // `[role="dialog"]` attribute selector would never match it.
      const dialogElement = document.querySelector('dialog[open], [role="dialog"]')
      if (!active || !dialogElement) return null
      if (dialogElement.contains(active)) return null
      if (active === document.body || active === document.documentElement) return null
      return active.tagName + ':' + (active.getAttribute('aria-label') ?? active.textContent ?? '').trim().slice(0, 30)
    })
    if (leaked) escapes.push(`step ${step} -> ${leaked}`)
  }

  expect(escapes, `focus reached interactive content outside the dialog: ${JSON.stringify(escapes)}`).toEqual([])

  // The close control must remain keyboard-reachable from inside the cycle.
  await expect(close).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await context.close()
})

test('shares one AI conversation between the inline section and the floating panel', async ({
  browser,
}) => {
  const { context, page } = await openContext(browser, { width: 1440, height: 900 })
  await installMockAssistant(page)
  await page.goto('/')
  await page.locator('#ai').scrollIntoViewIfNeeded()

  const section = page.locator('#ai')
  await section.getByLabel('Ask the portfolio assistant').fill('Cross engine question')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(section.getByText('Mock answer for: Cross engine question')).toBeVisible()

  await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
  const dialog = page.getByRole('dialog', { name: 'AI Portfolio Assistant' })
  await expect(dialog.getByText('Mock answer for: Cross engine question')).toBeVisible()

  await dialog.getByRole('button', { name: 'Close AI assistant' }).click()
  await expect(dialog).toBeHidden()
  await context.close()
})

test('shows a pending state and resolves on a slow network', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  await installMockAssistant(page, { delayMs: 1_200 })
  await page.goto('/')
  await page.locator('#ai').scrollIntoViewIfNeeded()

  const section = page.locator('#ai')
  await section.getByLabel('Ask the portfolio assistant').fill('Slow question')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')

  await expect(section.getByRole('status')).toContainText('thinking')
  await expect(section.getByText('Mock answer for: Slow question')).toBeVisible({ timeout: 15_000 })
  await context.close()
})

test('reports a retryable provider error and recovers on retry', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  const state = await installMockAssistant(page, { status: 500, failTimes: 1 })
  await page.goto('/')
  await page.locator('#ai').scrollIntoViewIfNeeded()

  const section = page.locator('#ai')
  await section.getByLabel('Ask the portfolio assistant').fill('Provider error question')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')

  const alert = section.getByRole('alert')
  await expect(alert).toContainText('temporarily unavailable')
  const retry = section.getByRole('button', { name: 'Retry' })
  await expect(retry).toBeVisible()

  await retry.click()
  await expect(section.getByText('Mock answer for: Provider error question')).toBeVisible({
    timeout: 15_000,
  })
  expect(state.requests).toBeGreaterThanOrEqual(2)
  await context.close()
})

test('reports a connection failure and keeps the portfolio and contact usable', async ({
  browser,
}) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  await installMockAssistant(page, { abort: true })
  await page.goto('/')
  await page.locator('#ai').scrollIntoViewIfNeeded()

  const section = page.locator('#ai')
  await section.getByLabel('Ask the portfolio assistant').fill('Offline question')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')

  await expect(section.getByRole('alert')).toContainText(/connection|could not be completed/i)

  // The assistant failing must not take the rest of the page down.
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await expect(page.locator('#contact').getByRole('link', { name: 'Email me' })).toBeVisible()
  await expect(page.locator('#credentials .credential-item')).toHaveCount(3)
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
  await expect(page.getByRole('contentinfo')).toBeInViewport()
  await expectNoHorizontalOverflow(page, 'assistant offline')
  await context.close()
})

test('selects the static tier under reduced motion', async ({ browser }) => {
  const { context, page } = await openContext(
    browser,
    { width: 1280, height: 720 },
    { reducedMotion: 'reduce' },
  )
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-tier', 'static')
  await expect(slot).toHaveAttribute('data-scene-reason', 'reduced-motion')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.hero-fallback')).toBeVisible()

  // Reduced motion must not cost content.
  for (const id of sectionIds) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await expect(page.locator(`#${id}`)).toBeVisible()
  }
  await context.close()
})

test('falls back to the static hero when WebGL is unavailable', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGLRenderingContext', {
      configurable: true,
      value: undefined,
    })
  })
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  await expect(slot).toHaveAttribute('data-scene-tier', 'static')
  await expect(slot).toHaveAttribute('data-scene-reason', 'webgl-unavailable')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.hero-fallback')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explore My Work' })).toBeVisible()
  await expectNoHorizontalOverflow(page, 'webgl unavailable')
  await context.close()
})

test('falls back when the WebGL context is lost', async ({ browser }) => {
  const { context, page } = await openContext(browser, { width: 1280, height: 720 })
  await page.goto('/')

  const slot = page.locator('.hero-scene-slot')
  const tier = await slot.getAttribute('data-scene-tier')
  test.skip(
    tier === 'static',
    'This engine never reaches a live canvas here, so there is no context to lose.',
  )

  await expect(page.locator('canvas')).toHaveCount(1)

  // The accepted Phase 3 contract loses the context only once the scene reports
  // `enhanced`. Firing `loseContext()` while the slot is still in `fallback`
  // races the R3F ContextLossMonitor's listener registration, so the event can
  // be dispatched before anything is subscribed to it.
  const becameEnhanced = await slot
    .evaluate(
      (element) =>
        new Promise<boolean>((resolve) => {
          if (element.getAttribute('data-scene-mode') === 'enhanced') return resolve(true)
          const observer = new MutationObserver(() => {
            if (element.getAttribute('data-scene-mode') === 'enhanced') {
              observer.disconnect()
              resolve(true)
            }
          })
          observer.observe(element, { attributes: true, attributeFilter: ['data-scene-mode'] })
          setTimeout(() => {
            observer.disconnect()
            resolve(false)
          }, 12_000)
        }),
    )
  test.skip(!becameEnhanced, 'This engine never reports an enhanced scene here.')

  const canLose = await page.locator('canvas').evaluate((canvas) => {
    const element = canvas as HTMLCanvasElement
    const gl = element.getContext('webgl2') ?? element.getContext('webgl')
    const extension = gl?.getExtension('WEBGL_lose_context')
    if (!extension) return false
    extension.loseContext()
    return true
  })
  test.skip(!canLose, 'WEBGL_lose_context is not exposed by this engine.')

  await expect(slot).toHaveAttribute('data-scene-reason', 'context-lost')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.hero-fallback')).toBeVisible()
  await context.close()
})
