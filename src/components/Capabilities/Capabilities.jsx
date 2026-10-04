import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { spotlightMove } from '../Hero/spotlight'
import RevealText from '../Shared/RevealText'
import { capabilitiesContent, GROUP_ACCENT, REPO_BASE } from './capabilitiesContent'
import styles from './Capabilities.module.css'

const REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export default function Capabilities() {
  const { eyebrow, title, intro, filters, items } = capabilitiesContent
  const [filter, setFilter] = useState('all')
  const visible = items.filter((item) => filter === 'all' || item.groups.includes(filter))

  return (
    <section id="capabilities" className={styles.section}>
      <div className={styles.inner}>
        <motion.header className={styles.header} {...REVEAL}>
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> {eyebrow}
          </span>
          <h2 className={styles.title}>
            <RevealText lines={title} />
          </h2>
          <p className={styles.intro}>{intro}</p>

          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={f.id === filter}
                onClick={() => setFilter(f.id)}
                className={`${styles.filter} ${f.id === filter ? styles.filterActive : ''}`}
              >
                {f.id === filter && (
                  <motion.span
                    layoutId="filter-pill"
                    className={styles.filterPill}
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className={styles.filterLabel}>{f.label}</span>
              </button>
            ))}
          </div>
        </motion.header>

        <motion.div layout className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <motion.article
                key={item.title}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: 'easeOut' }}
                className={styles.card}
                style={{ '--color-red': GROUP_ACCENT[item.groups[0]] }}
                onPointerMove={spotlightMove}
              >
                <div className={styles.tickMark} />
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.desc}>{item.desc}</p>
                <div className={styles.stack}>
                  {item.stack.map((s) => (
                    <span key={s} className={styles.tag}>
                      {s}
                    </span>
                  ))}
                </div>
                <div className={styles.examples}>
                  <span className={styles.examplesLabel}>REAL REPOSITORIES</span>
                  {item.examples.map((repo) => (
                    <a
                      key={repo}
                      className={styles.repo}
                      href={`${REPO_BASE}${repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {repo}
                    </a>
                  ))}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
