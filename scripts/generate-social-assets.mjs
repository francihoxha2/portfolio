// Regenerates the static social-preview and icon bitmaps in public/.
//
//   node scripts/generate-social-assets.mjs
//
// These files are not loaded by the page; they exist for link unfurls, browser
// tabs, and iOS home screens. Playwright is already a dev dependency, so this
// adds no runtime or build dependency - it renders the same tokens and brand
// fonts the site uses and screenshots them.
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const root = process.cwd()
const publicDirectory = resolve(root, 'public')

const { portfolio } = await import('../shared/portfolio.ts')

const tokens = {
  bg0: '#050508',
  bg1: '#080a12',
  surface: '#0d1019',
  text: '#f3f5fa',
  muted: '#a4acc0',
  violet: '#8270ff',
  cyan: '#5ddde6',
  eyebrow: '#b5adff',
}

async function fontFace(family, file, weightRange) {
  const data = await readFile(resolve(root, 'node_modules', file))

  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weightRange};src:url(data:font/woff2;base64,${data.toString('base64')}) format('woff2');}`
}

const fonts = [
  await fontFace(
    'Space Grotesk Social',
    '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
    '300 700',
  ),
  await fontFace(
    'Geist Social',
    '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
    '100 900',
  ),
].join('')

const location = portfolio.contact.find(
  (channel) => channel.id === 'location' && channel.public,
)?.value ?? portfolio.identity.name

const socialCard = `<!doctype html><html><head><meta charset="utf-8" /><style>
${fonts}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;color:${tokens.text};
  background:
    radial-gradient(circle at 84% 8%, rgba(130,112,255,0.30), transparent 640px),
    radial-gradient(circle at 6% 92%, rgba(93,221,230,0.16), transparent 560px),
    linear-gradient(160deg, ${tokens.bg1}, ${tokens.bg0} 62%);
  font-family:'Geist Social', system-ui, sans-serif;}
.grid{position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size:80px 80px;
  -webkit-mask-image:linear-gradient(150deg, #000, transparent 78%);}
.frame{position:relative;display:flex;flex-direction:column;justify-content:space-between;
  height:100%;padding:76px 82px}
.top{display:flex;align-items:center;gap:22px}
.mark{display:flex;width:76px;height:76px;align-items:center;justify-content:center;
  border:3px solid ${tokens.violet};border-radius:20px;background:${tokens.surface};
  font-family:'Space Grotesk Social', sans-serif;font-size:32px;font-weight:700;letter-spacing:-1.5px}
.who{display:flex;flex-direction:column;gap:6px}
.name{font-family:'Space Grotesk Social', sans-serif;font-size:31px;font-weight:650;letter-spacing:-0.6px}
.role{color:${tokens.muted};font-size:22px}
h1{max-width:19ch;font-family:'Space Grotesk Social', sans-serif;font-size:74px;font-weight:650;
  letter-spacing:-2.6px;line-height:1.02}
.capabilities{display:flex;align-items:center;gap:18px;margin-top:30px;
  color:${tokens.eyebrow};font-size:25px;font-weight:500;letter-spacing:2px}
.rule{width:96px;height:3px;border-radius:2px;
  background:linear-gradient(90deg, ${tokens.violet}, ${tokens.cyan})}
.foot{display:flex;align-items:center;justify-content:space-between;
  padding-top:34px;border-top:1px solid rgba(255,255,255,0.12);color:${tokens.muted};font-size:21px}
.dot{display:inline-block;width:10px;height:10px;margin-right:12px;border-radius:50%;
  background:${tokens.cyan};vertical-align:middle}
</style></head><body>
<div class="grid"></div>
<div class="frame">
  <div class="top">
    <div class="mark">FH</div>
    <div class="who">
      <div class="name">${portfolio.identity.name}</div>
      <div class="role">${portfolio.identity.title}</div>
    </div>
  </div>
  <div>
    <h1>${portfolio.identity.heroStatement}</h1>
    <div class="capabilities"><span class="rule"></span>${portfolio.identity.capabilityLine}</div>
  </div>
  <div class="foot">
    <span><span class="dot"></span>${location}</span>
    <span>Planify &middot; Selected work &middot; Portfolio assistant</span>
  </div>
</div>
</body></html>`

const iconCard = async (size) => {
  const svg = await readFile(resolve(publicDirectory, 'favicon-fh.svg'), 'utf8')

  return `<!doctype html><html><head><meta charset="utf-8" /><style>
${fonts}
*{margin:0;padding:0}
body{width:${size}px;height:${size}px;overflow:hidden;background:${tokens.surface}}
svg{display:block;width:${size}px;height:${size}px}
text{font-family:'Space Grotesk Social', sans-serif !important}
</style></head><body>${svg}</body></html>`
}

const browser = await chromium.launch({ channel: 'chrome' })

async function shoot(html, width, height, file) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'load' })
  // Evaluated as a string so the browser-context global stays out of this module's scope.
  await page.evaluate('document.fonts.ready')
  const buffer = await page.screenshot({ type: 'png' })
  await writeFile(resolve(publicDirectory, file), buffer)
  await page.close()
  console.log(`wrote public/${file} (${width}x${height}, ${buffer.length} bytes)`)
}

try {
  await shoot(
    socialCard,
    portfolio.metadata.socialImageWidth,
    portfolio.metadata.socialImageHeight,
    portfolio.metadata.socialImagePath.replace(/^\//, ''),
  )
  await shoot(await iconCard(180), 180, 180, 'apple-touch-icon.png')
  await shoot(await iconCard(48), 48, 48, 'favicon-48.png')
} finally {
  await browser.close()
}
