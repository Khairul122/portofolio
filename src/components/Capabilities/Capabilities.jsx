import { useState } from 'react'
import { motion } from 'framer-motion'
import RevealText from '../Shared/RevealText'
import { capabilitiesContent, REPO_BASE } from './capabilitiesContent'
import styles from './Capabilities.module.css'

// Panels that fold open. One kind of work is open at a time, so the open one can
// show its real repositories at a readable size instead of squeezing six cards.
export default function Capabilities() {
  const { title, intro, items } = capabilitiesContent
  const [open, setOpen] = useState(0)

  return (
    <section id="capabilities" className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className={styles.title}>
            <RevealText lines={title} />
          </h2>
          <p className={styles.intro}>{intro}</p>
        </motion.header>

        <motion.div
          className={styles.slats}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {items.map((item, i) => {
            const on = i === open
            return (
              <div key={item.title} className={styles.slat} data-open={on} style={{ '--slat': item.color }}>
                <button
                  type="button"
                  id={`cap-tab-${i}`}
                  className={styles.head}
                  aria-expanded={on}
                  aria-controls={`cap-panel-${i}`}
                  onClick={() => setOpen(i)}
                >
                  <span className={styles.num}>0{i + 1}</span>
                  <span className={styles.slatTitle}>{item.title}</span>
                </button>

                <div id={`cap-panel-${i}`} role="region" aria-labelledby={`cap-tab-${i}`} className={styles.body} hidden={!on}>
                  <p className={styles.desc}>{item.desc}</p>
                  <ul className={styles.stack} aria-label="Stack">
                    {item.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <h3 className={styles.reposTitle}>REAL REPOSITORIES</h3>
                  <ul className={styles.repos}>
                    {item.examples.map((name) => (
                      <li key={name}>
                        <a href={`${REPO_BASE}${name}`} target="_blank" rel="noopener noreferrer">
                          {name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
