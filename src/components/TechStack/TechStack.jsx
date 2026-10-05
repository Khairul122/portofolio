import { useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { formatDate, LANG_COLOR, REPO_URL } from '../../data/githubStats'
import { useGithub } from '../../data/GithubProvider'
import DataSource from '../Shared/DataSource'
import { CoveredContext } from '../Shared/CoveredContext'
import RevealText from '../Shared/RevealText'
import styles from './TechStack.module.css'

const W = 1000
const H = 540
const SHORT = { 'Jupyter Notebook': 'Jupyter' }
const LEGEND = [
  { color: '#e8342a', label: 'WEB' },
  { color: '#14803f', label: 'MOBILE' },
  { color: '#7c3aed', label: 'PYTHON AND ML' },
  { color: '#a16207', label: 'C++ AND OTHER' },
]

// Deterministic circle packing: biggest first, each one walks an ellipse-shaped
// spiral from the centre until it finds a free spot. Same result on every load.
function pack(items) {
  const placed = []
  for (const item of [...items].sort((a, b) => b.count - a.count)) {
    const r = 17 * Math.sqrt(item.count) + 10
    let spot = { x: W / 2, y: H / 2 }
    for (let t = 0; t < 6000; t++) {
      const x = W / 2 + Math.cos(t * 0.5) * t * 0.9
      const y = H / 2 + Math.sin(t * 0.5) * t * 0.5
      if (x - r < 8 || x + r > W - 8 || y - r < 8 || y + r > H - 8) continue
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) >= p.r + r + 8)) {
        spot = { x, y }
        break
      }
    }
    placed.push({ ...item, r, ...spot })
  }
  return placed
}

const detailsOf = (repos, lang) => {
  const list = repos.filter((r) => r.lang === lang)
  return { first: list[0], newest: list.slice(-6).reverse(), count: list.length }
}

export default function TechStack() {
  const { languages, repos, total } = useGithub()
  const bubbles = useMemo(() => pack(languages), [languages])
  const [picked, setPicked] = useState(null)
  // A language that disappears from live data falls back to the biggest one.
  const selected = languages.some((l) => l.label === picked) ? picked : languages[0].label
  const setSelected = setPicked
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.15 })
  const covered = useContext(CoveredContext)
  const info = detailsOf(repos, selected)

  return (
    <section id="stack" className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> TECH STACK
          </span>
          <h2 className={styles.title}>
            <RevealText lines={['WHAT I', 'BUILD WITH']} />
          </h2>
          <p className={styles.intro}>
            One bubble per language, sized by how many of my {total} repositories use it. Hover or tap a bubble to see the repos behind it.
          </p>
          <DataSource />
        </motion.header>

        <div className={styles.layout}>
          <div ref={ref} className={styles.stage} data-paused={!inView || covered}>
            <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Languages by number of repositories">
              {bubbles.map((b, i) => {
                const color = LANG_COLOR[b.label] || '#15181d'
                const on = b.label === selected
                const fs = Math.min(20, b.r * 0.3)
                return (
                  <g key={b.label} transform={`translate(${b.x} ${b.y})`}>
                    <g
                      className={styles.float}
                      data-dim={!on}
                      style={{ '--dur': `${6 + (i % 5)}s`, '--delay': `${-i * 0.7}s` }}
                    >
                      <motion.g
                        className={styles.bubble}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: i * 0.06 }}
                        tabIndex={0}
                        role="button"
                        aria-pressed={on}
                        aria-label={`${b.label}, ${b.count} repositories`}
                        onPointerEnter={() => setSelected(b.label)}
                        onFocus={() => setSelected(b.label)}
                        onClick={() => setSelected(b.label)}
                      >
                        <circle r={b.r} fill={color} className={styles.disc} data-on={on} />
                        <text y={b.r > 40 ? -fs * 0.2 : fs * 0.35} fontSize={fs} className={styles.label}>
                          {SHORT[b.label] || b.label}
                        </text>
                        {b.r > 40 && (
                          <text y={fs * 1.1} fontSize={fs * 0.8} className={styles.count}>
                            {b.count}
                          </text>
                        )}
                      </motion.g>
                    </g>
                  </g>
                )
              })}
            </svg>
            <ul className={styles.legend}>
              {LEGEND.map((l) => (
                <li key={l.label}>
                  <i style={{ background: l.color }} aria-hidden="true" />
                  {l.label}
                </li>
              ))}
            </ul>
          </div>

          <aside className={styles.panel} aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <span className={styles.panelKicker} style={{ color: LANG_COLOR[selected] }}>
                  LANGUAGE
                </span>
                <h3 className={styles.panelTitle}>{selected}</h3>
                <div className={styles.facts}>
                  <div>
                    <strong>{info.count}</strong>
                    <span>REPOSITORIES</span>
                  </div>
                  <div>
                    <strong>{Math.round((info.count / total) * 100)}%</strong>
                    <span>OF ALL REPOS</span>
                  </div>
                  <div>
                    <strong>{info.first.year}</strong>
                    <span>FIRST USED</span>
                  </div>
                </div>
                <div className={styles.bar} aria-hidden="true">
                  <motion.i
                    style={{ background: LANG_COLOR[selected] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(info.count / languages[0].count) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <h4 className={styles.listTitle}>NEWEST REPOSITORIES</h4>
                <ul className={styles.list}>
                  {info.newest.map((r) => (
                    <li key={r.name}>
                      <a href={`${REPO_URL}${r.name}`} target="_blank" rel="noopener noreferrer">
                        {r.name}
                      </a>
                      <span>{formatDate(r.date)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </section>
  )
}
