// Captures the Phase 11 cross-browser / cross-device acceptance evidence.
//
//   npm run evidence:phase11
//
// Gated out of `npm run test:e2e` for the same reason as the Phase 10 capture:
// screenshotting across four engines competes with the timing-sensitive
// functional specs for the worker pool. This sets the flag the evidence spec
// looks for and runs it on a single worker.
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { join } from 'node:path'

const runner = spawn(
  process.execPath,
  [
    join(process.cwd(), 'scripts', 'run-playwright.mjs'),
    'phase11-evidence.spec.ts',
    '--workers=1',
    ...process.argv.slice(2),
  ],
  {
    cwd: process.cwd(),
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, PHASE11_EVIDENCE: '1' },
  },
)

const [exitCode] = await once(runner, 'exit')
process.exitCode = typeof exitCode === 'number' ? exitCode : 1
