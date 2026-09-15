import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Browser } from '@playwright/test'

const artifactDirectory = resolve('artifacts/phase9')

// The floating launcher and sticky header are hidden only for framing, so the
// captured evidence shows the closing sections themselves.
const chromeless = '.site-header, .chat-widget, .skip-link { display: none !important; }'

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

test('captures the Phase 9 contact and footer evidence', async ({ browser }) => {
  test.setTimeout(90_000)
  await mkdir(artifactDirectory, { recursive: true })

  const desktopContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    viewport: { width: 1440, height: 900 },
  })
  const desktop = await desktopContext.newPage()
  await desktop.goto('/')
  await desktop.evaluate(() => document.fonts.ready)

  // The launcher stays visible here: this frame is the collision evidence.
  await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(desktop.getByRole('contentinfo')).toBeInViewport()
  await desktop.screenshot({
    path: resolve(artifactDirectory, '01-1440-contact-footer-with-launcher.png'),
    animations: 'disabled',
  })

  await desktop.addStyleTag({ content: chromeless })
  await desktop.locator('#contact').screenshot({
    path: resolve(artifactDirectory, '02-1440-contact.png'),
    animations: 'disabled',
  })
  await desktop.locator('.site-footer').screenshot({
    path: resolve(artifactDirectory, '03-1440-footer.png'),
    animations: 'disabled',
  })

  // AI to Contact transition: the seam between the assistant and the closing.
  await desktop.locator('#contact').scrollIntoViewIfNeeded()
  await desktop.evaluate(() => {
    const contact = document.querySelector('#contact')
    if (contact) window.scrollBy(0, -420)
  })
  await desktop.screenshot({
    path: resolve(artifactDirectory, '04-1440-ai-to-contact-transition.png'),
    animations: 'disabled',
  })
  await desktopContext.close()

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
  ]) {
    const { context, page } = await openTouchPage(browser, viewport)
    await page.addStyleTag({ content: chromeless })
    await page.locator('#contact').screenshot({
      path: resolve(artifactDirectory, `05-${viewport.width}-contact.png`),
      animations: 'disabled',
    })
    await page.locator('.site-footer').screenshot({
      path: resolve(artifactDirectory, `06-${viewport.width}-footer.png`),
      animations: 'disabled',
    })
    await context.close()
  }

  // Full closing viewport at the narrowest supported width, launcher included.
  const narrow = await openTouchPage(browser, { width: 320, height: 568 })
  await narrow.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await narrow.page.screenshot({
    path: resolve(artifactDirectory, '07-320-closing-flow-with-launcher.png'),
    animations: 'disabled',
  })
  await narrow.context.close()

  const landscape = await openTouchPage(browser, { width: 667, height: 375 })
  await landscape.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await landscape.page.screenshot({
    path: resolve(artifactDirectory, '08-short-landscape-closing-flow.png'),
    animations: 'disabled',
  })
  await landscape.context.close()

  const noJs = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  })
  const noJsPage = await noJs.newPage()
  await noJsPage.goto('/')
  await noJsPage.screenshot({
    path: resolve(artifactDirectory, '09-1440-noscript-fallback.png'),
    animations: 'disabled',
  })
  await noJs.close()
})
