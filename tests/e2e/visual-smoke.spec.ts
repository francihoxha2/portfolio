import { expect, test } from '@playwright/test'

test('captures the desktop foundation for visual review', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Skip to content' })).not.toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('desktop-hero.png') })
  await page.locator('#work').screenshot({
    path: testInfo.outputPath('desktop-flagship.png'),
  })
  await expect(page.getByRole('link', { name: 'Skip to content' })).not.toBeInViewport()
  await page.locator('#stack').screenshot({
    path: testInfo.outputPath('desktop-stack.png'),
  })
})

test('captures the mobile foundation and open navigation for visual review', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await page.locator('.menu-toggle').click()
  await expect(page.locator('#mobile-navigation')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('mobile-menu.png') })
  await page.keyboard.press('Escape')
  await page.locator('#stack').scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('mobile-stack.png') })
})
