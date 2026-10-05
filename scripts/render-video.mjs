// Renders the intro video (16:9, the format the site uses; render recap-portrait by hand
// for Reels) plus a poster still into public/video/. Remotion downloads its own headless
// Chromium on first run. If that is blocked, point REMOTION_BROWSER at a local Chrome/Edge.
// Renders to a temp folder first: on Windows a running dev server or open browser tab can
// lock the file in public/video and make Remotion's final rename fail with EPERM.
import { copyFileSync, mkdirSync, mkdtempSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const browser = process.env.REMOTION_BROWSER ? ` --browser-executable="${process.env.REMOTION_BROWSER}"` : ''
const run = (cmd) => execSync(cmd + browser, { stdio: 'inherit' })
const tmp = mkdtempSync(join(tmpdir(), 'recap-'))
const out = 'public/video'
mkdirSync(out, { recursive: true })

for (const [id, name] of [['recap-landscape', 'recap-16x9']]) {
  run(`npx remotion render video/index.js ${id} "${join(tmp, name)}.mp4" --crf=26`)
  run(`npx remotion still video/index.js ${id} "${join(tmp, name)}.jpg" --frame=70 --jpeg-quality=82`)
  for (const ext of ['mp4', 'jpg']) copyFileSync(join(tmp, `${name}.${ext}`), `${out}/${name}.${ext}`)
}
