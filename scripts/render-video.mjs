// Renders the intro video (16:9, the format the site uses; render recap-portrait by hand for Reels) plus poster stills into public/video/.
// Remotion downloads its own headless Chromium on first run. If that is blocked,
// point REMOTION_BROWSER at a local Chrome/Edge executable instead.
import { execSync } from 'node:child_process'

const browser = process.env.REMOTION_BROWSER ? ` --browser-executable="${process.env.REMOTION_BROWSER}"` : ''
const run = (cmd) => execSync(cmd + browser, { stdio: 'inherit' })
const out = 'public/video'
for (const [id, name] of [['recap-landscape', 'recap-16x9']]) {
  run(`npx remotion render video/index.js ${id} ${out}/${name}.mp4 --crf=26`)
  run(`npx remotion still video/index.js ${id} ${out}/${name}.jpg --frame=70 --jpeg-quality=82`)
}
