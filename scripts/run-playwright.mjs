import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { join } from 'node:path'

const host = '127.0.0.1'
const port = '4173'
const baseUrl = `http://${host}:${port}`
const root = process.cwd()
const forwardedArgs = process.argv.slice(2)
let server

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function isReady() {
  try {
    const response = await fetch(baseUrl)
    return response.ok
  } catch {
    return false
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await isReady()) return
    if (server?.exitCode !== null) {
      throw new Error(`Vite preview exited before the test server was ready (${server?.exitCode}).`)
    }
    await delay(200)
  }

  throw new Error('Timed out waiting for the portfolio preview server.')
}

async function buildForPreview() {
  const build = spawn(
    process.execPath,
    [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'],
    { cwd: root, stdio: 'inherit', windowsHide: true },
  )
  const [exitCode] = await once(build, 'exit')

  if (exitCode !== 0) {
    throw new Error(`Production build failed before browser tests (${exitCode}).`)
  }
}

async function stopServer() {
  if (!server || server.exitCode !== null) return
  server.kill()
  await Promise.race([once(server, 'exit'), delay(2_000)])
}

try {
  if (!(await isReady())) {
    await buildForPreview()
    server = spawn(
      process.execPath,
      [
        join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
        'preview',
        '--host',
        host,
        '--port',
        port,
        '--strictPort',
      ],
      { cwd: root, stdio: 'ignore', windowsHide: true },
    )
    await waitForServer()
  }

  const testRunner = spawn(
    process.execPath,
    [
      join(root, 'node_modules', '@playwright', 'test', 'cli.js'),
      'test',
      ...forwardedArgs,
    ],
    { cwd: root, stdio: 'inherit', windowsHide: true },
  )
  const [exitCode] = await once(testRunner, 'exit')
  process.exitCode = typeof exitCode === 'number' ? exitCode : 1
} finally {
  await stopServer()
}
