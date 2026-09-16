import { defineConfig } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: join(tmpdir(), `portfolio-playwright-results-${process.pid}`),
  fullyParallel: true,
  // Phase 10: the suite grew past what eight concurrent workers can schedule
  // reliably on a development machine. At eight, timing-sensitive interaction
  // and evidence specs failed intermittently and in different files each run
  // while passing in isolation. Four keeps the suite deterministic.
  workers: 4,
  forbidOnly: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: { browserName: 'chromium', channel: 'chrome' },
    },
    // Phase 11: only the cross-browser matrix spec runs in the other engines.
    // The accepted Phase 0-10 specs stay Chrome-only on purpose - several of
    // them assert Chromium-specific diagnostics (forced colors, renderer
    // budgets, CDP throttling) that a second engine would fail for tooling
    // reasons rather than product defects.
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
      testMatch: /phase11-(cross-browser|evidence)\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
      testMatch: /phase11-(cross-browser|evidence)\.spec\.ts/,
    },
    {
      name: 'edge',
      use: { browserName: 'chromium', channel: 'msedge' },
      testMatch: /phase11-(cross-browser|evidence)\.spec\.ts/,
    },
  ],
})
