import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'

test('captures Phase 8 desktop and mobile acceptance evidence with a mocked API', async ({ page }) => {
  test.setTimeout(60_000)
  const evidenceDir = resolve(process.cwd(), 'artifacts', 'phase8')
  await mkdir(evidenceDir, { recursive: true })

  let mode: 'success' | 'error' | 'pending' = 'success'
  let releasePending: (() => void) | undefined
  await page.route('**/api/chat', async (route) => {
    const payload = route.request().postDataJSON()
    const question = payload.messages.at(-1).content

    if (mode === 'pending') {
      await new Promise<void>((resolvePending) => {
        releasePending = resolvePending
      })
    }

    if (mode === 'error') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'mocked failure', code: 'SERVICE_UNAVAILABLE' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: `Mock portfolio answer for: ${question}` }),
    })
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const section = page.locator('#ai')
  await section.scrollIntoViewIfNeeded()
  await section.screenshot({ path: resolve(evidenceDir, 'desktop-ai-empty.png') })

  await section.getByLabel('Ask the portfolio assistant').fill('What projects has Franci built?')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(section.getByText(/Mock portfolio answer/)).toBeVisible()
  await section.screenshot({ path: resolve(evidenceDir, 'desktop-ai-conversation.png') })

  await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
  const dialog = page.getByRole('dialog', { name: 'AI Portfolio Assistant' })
  await expect(dialog.getByText('What projects has Franci built?', { exact: true })).toBeVisible()
  await dialog.evaluate(async (panel) => {
    await Promise.all(panel.getAnimations().map((animation) => animation.finished))
  })
  await page.screenshot({
    path: resolve(evidenceDir, 'desktop-floating-same-conversation.png'),
  })
  await dialog.getByRole('button', { name: 'Close AI assistant' }).click()
  await section.getByRole('button', { name: 'New conversation' }).click()

  mode = 'error'
  await section.getByLabel('Ask the portfolio assistant').fill('Show the safe error state')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(section.getByText(/temporarily unavailable/i)).toBeVisible()
  await section.screenshot({ path: resolve(evidenceDir, 'desktop-ai-error.png') })
  await section.getByRole('button', { name: 'New conversation' }).click()

  mode = 'pending'
  await section.getByLabel('Ask the portfolio assistant').fill('Show the pending state')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(section.getByRole('status')).toBeVisible()
  await section.screenshot({ path: resolve(evidenceDir, 'desktop-ai-pending.png') })
  releasePending?.()
  mode = 'success'
  await expect(section.getByText(/Mock portfolio answer/)).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await page.locator('#ai').evaluate((section) => {
    window.scrollTo({ top: (section as HTMLElement).offsetTop - 72, behavior: 'instant' })
  })
  await page.screenshot({ path: resolve(evidenceDir, 'mobile-ai-section.png') })
  await page.locator('#ai').getByLabel('Ask the portfolio assistant').fill('Tell me about Planify.')
  await page.locator('#ai').getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(page.locator('#ai').getByText(/Mock portfolio answer/)).toBeVisible()
  await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
  await expect(dialog.getByText('Tell me about Planify.', { exact: true })).toBeVisible()
  await dialog.evaluate(async (panel) => {
    await Promise.all(panel.getAnimations().map((animation) => animation.finished))
  })
  await page.screenshot({ path: resolve(evidenceDir, 'mobile-floating-continuity.png') })

  await page.setViewportSize({ width: 390, height: 560 })
  await expect(dialog.getByLabel('Ask the portfolio assistant')).toBeInViewport()
  await page.screenshot({ path: resolve(evidenceDir, 'mobile-keyboard-height.png') })
})
