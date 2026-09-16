// Captures the Phase 10 manual-acceptance evidence.
//
//   npm run evidence:phase10
//
// The recordings are gated out of `npm run test:e2e` because video encoding is
// CPU-heavy enough to destabilise the timing-sensitive functional specs. This
// sets the flag the evidence spec looks for and runs it on a single worker.
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { join } from 'node:path'

const runner = spawn(
  process.execPath,
  [
    join(process.cwd(), 'scripts', 'run-playwright.mjs'),
    'phase10-evidence.spec.ts',
    '--workers=1',
    ...process.argv.slice(2),
  ],
  {
    cwd: process.cwd(),
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, PHASE10_EVIDENCE: '1' },
  },
)

const [exitCode] = await once(runner, 'exit')
process.exitCode = typeof exitCode === 'number' ? exitCode : 1
