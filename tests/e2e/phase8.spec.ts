import { expect, test, type Page } from '@playwright/test'

async function installMockAssistant(page: Page, delayMs = 0) {
  let requests = 0
  await page.route('**/api/chat', async (route) => {
    requests += 1
    const payload = route.request().postDataJSON()
    const question = payload.messages.at(-1).content
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: `Mock answer for: ${question}` }),
    })
  })
  return () => requests
}

async function openInlineAssistant(page: Page) {
  await page.goto('/')
  await page.locator('#ai').scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Open AI portfolio assistant' })).toBeVisible()
}

test('AI section and floating panel share one bidirectional conversation and reset', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await installMockAssistant(page)
  await openInlineAssistant(page)

  const section = page.locator('#ai')
  await section.getByLabel('Ask the portfolio assistant').fill('Question A from the AI section')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(section.getByText('Mock answer for: Question A from the AI section')).toBeVisible()

  await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
  const dialog = page.getByRole('dialog', { name: 'AI Portfolio Assistant' })
  await expect(dialog.getByText('Question A from the AI section', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Mock answer for: Question A from the AI section')).toBeVisible()

  await dialog.getByLabel('Ask the portfolio assistant').fill('Question B from the floating panel')
  await dialog.getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(dialog.getByText('Mock answer for: Question B from the floating panel')).toBeVisible()

  await dialog.getByRole('button', { name: 'Close AI assistant' }).click()
  await expect(dialog).toBeHidden()
  await expect(section.getByText('Question B from the floating panel', { exact: true })).toBeVisible()
  await expect(section.getByText('Mock answer for: Question B from the floating panel')).toBeVisible()

  await section.getByRole('button', { name: 'New conversation' }).click()
  await expect(section.getByText('Question A from the AI section', { exact: true })).toHaveCount(0)
  await expect(section.getByText('Question B from the floating panel', { exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
  await expect(dialog.getByText('Question A from the AI section', { exact: true })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Tell me about Planify.' })).toBeVisible()
})

test('one pending request blocks duplicate submission across both surfaces', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  const requestCount = await installMockAssistant(page, 350)
  await openInlineAssistant(page)

  const section = page.locator('#ai')
  const input = section.getByLabel('Ask the portfolio assistant')
  await input.fill('Send exactly once')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await expect(section.getByRole('status')).toContainText('thinking')

  await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
  const dialog = page.getByRole('dialog', { name: 'AI Portfolio Assistant' })
  await expect(dialog.getByRole('status')).toContainText('thinking')
  await expect(dialog.getByLabel('Ask the portfolio assistant')).toBeDisabled()
  expect(requestCount()).toBe(1)

  await expect(dialog.getByText('Mock answer for: Send exactly once')).toBeVisible()
  expect(requestCount()).toBe(1)
})

test('a sanitized service error and manual retry are shared', async ({ page }) => {
  let requestCount = 0
  await page.route('**/api/chat', async (route) => {
    requestCount += 1
    if (requestCount === 1) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'raw provider detail', code: 'SERVICE_UNAVAILABLE' }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: 'Recovered mock answer' }),
    })
  })
  await openInlineAssistant(page)

  const section = page.locator('#ai')
  await section.getByLabel('Ask the portfolio assistant').fill('Show a safe error')
  await section.getByLabel('Ask the portfolio assistant').press('Enter')
  await expect(section.getByText(/temporarily unavailable/i)).toBeVisible()
  await expect(section.getByText(/raw provider detail/i)).toHaveCount(0)

  await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
  const dialog = page.getByRole('dialog', { name: 'AI Portfolio Assistant' })
  await expect(dialog.getByText(/temporarily unavailable/i)).toBeVisible()
  await dialog.getByRole('button', { name: 'Retry' }).click()
  await expect(dialog.getByText('Recovered mock answer')).toBeVisible()
  await expect(section.getByText('Recovered mock answer')).toBeAttached()
  expect(requestCount).toBe(2)
})

for (const viewport of [
  { name: 'minimum phone', width: 320, height: 568 },
  { name: 'compact phone', width: 360, height: 640 },
  { name: 'phone', width: 375, height: 667 },
  { name: 'modern phone', width: 390, height: 844 },
  { name: 'large phone', width: 430, height: 932 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'short landscape phone', width: 844, height: 390 },
]) {
  test(`assistant reflows without overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await installMockAssistant(page)
    await openInlineAssistant(page)

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)

    if (viewport.width <= 600) {
      const fontSize = await page.locator('#assistant-composer-inline').evaluate(
        (input) => Number.parseFloat(getComputedStyle(input).fontSize),
      )
      expect(fontSize).toBeGreaterThanOrEqual(16)
    }

    await page.getByRole('button', { name: 'Open AI portfolio assistant' }).click()
    const dialog = page.getByRole('dialog', { name: 'AI Portfolio Assistant' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('Ask the portfolio assistant')).toBeInViewport()
    await expect(dialog.getByRole('button', { name: 'Close AI assistant' })).toBeInViewport()
    await expect(dialog.getByRole('button', { name: 'New conversation' })).toBeInViewport()

    const box = await dialog.boundingBox()
    expect(box).not.toBeNull()
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0)
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width + 1)
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height + 1)
  })
}
