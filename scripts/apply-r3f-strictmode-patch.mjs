import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const supportedVersion = '9.7.0'
const fiberDirectory = path.join(
  process.cwd(),
  'node_modules',
  '@react-three',
  'fiber',
)

const packageJson = JSON.parse(
  await readFile(path.join(fiberDirectory, 'package.json'), 'utf8'),
)

if (packageJson.version !== supportedVersion) {
  throw new Error(
    `Review the R3F StrictMode patch before using @react-three/fiber ${packageJson.version}; `
      + `it is verified only for ${supportedVersion}.`,
  )
}

const distDirectory = path.join(fiberDirectory, 'dist')
const eventFiles = (await readdir(distDirectory))
  .filter((fileName) => /^events-.*\.js$/.test(fileName))

const original = `        setTimeout(() => {
          try {
            var _state$gl, _state$gl$renderLists, _state$gl2, _state$gl3;`
const patched = `        setTimeout(() => {
          const currentRoot = _roots.get(canvas);
          if (currentRoot && currentRoot.store.getState().internal.active) return;
          try {
            var _state$gl, _state$gl$renderLists, _state$gl2, _state$gl3;`

let patchedCount = 0
let currentCount = 0

for (const fileName of eventFiles) {
  const filePath = path.join(distDirectory, fileName)
  const source = await readFile(filePath, 'utf8')

  if (!source.includes('function unmountComponentAtNode(canvas, callback)')) continue
  if (!source.includes('forceContextLoss')) continue

  if (source.includes(patched)) {
    currentCount += 1
    continue
  }

  const matches = source.split(original).length - 1
  if (matches !== 1) {
    throw new Error(
      `Expected one deferred R3F renderer cleanup in ${fileName}; found ${matches}.`,
    )
  }

  await writeFile(filePath, source.replace(original, patched), 'utf8')
  patchedCount += 1
}

if (patchedCount + currentCount !== 3) {
  throw new Error(
    `Expected three R3F event bundles; patched ${patchedCount} and found ${currentCount} current.`,
  )
}

console.info(
  `R3F StrictMode lifecycle patch: ${patchedCount} patched, ${currentCount} already current.`,
)
