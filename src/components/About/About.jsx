import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import CountUp from '../Hero/CountUp'
import { spotlightMove } from '../Hero/spotlight'
import RevealText from '../Shared/RevealText'
import Lanyard from './Lanyard'
import { aboutContent } from './aboutContent'
import styles from './About.module.css'

const REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

function RoleCard({ role, index }) {
  return (
    <motion.article
      className={styles.card}
      style={{ '--color-red': role.accent }}
      onPointerMove={spotlightMove}
      {...REVEAL}
      transition={{ ...REVEAL.transition, delay: index * 0.08 }}
    >
      <div className={styles.tickMark} />
      <div className={styles.topRow}>
        <h3 className={styles.roleTitle}>{role.title}</h3>
        <span className={styles.badge}>{role.badge}</span>
      </div>
      <p className={styles.desc}>{role.desc}</p>
      <p className={styles.examples}>{role.examples}</p>
    </motion.article>
  )
}

function ActivityCard({ activity }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const max = Math.max(...activity.years.map((y) => y.value))

  return (
    <motion.div className={`${styles.card} ${styles.activityCard}`} onPointerMove={spotlightMove} {...REVEAL}>
      <div className={styles.tickMark} />
      <div className={styles.topRow}>
        <h3 className={styles.roleTitle}>{activity.label}</h3>
      </div>
      <div ref={ref} className={styles.chart}>
        {inView &&
          activity.years.map((y, i) => (
            <div key={y.year} className={styles.column}>
              <span className={styles.columnValue}>
                <CountUp value={y.value} delay={0.1 * i} />
              </span>
              <div className={styles.columnTrack}>
                <motion.div
                  className={styles.columnFill}
                  initial={{ height: 0 }}
                  animate={{ height: `${(y.value / max) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.1 * i, ease: 'easeOut' }}
                />
              </div>
              <span className={styles.columnYear}>{y.year}</span>
            </div>
          ))}
      </div>
      <p className={styles.note}>{activity.note}</p>
    </motion.div>
  )
}

// Show the CV button only when a real PDF is served (a missing file would
// otherwise fall back to index.html on SPA hosts and download a broken "pdf").
function useFileExists(href) {
  const [exists, setExists] = useState(false)
  useEffect(() => {
    let cancelled = false
    fetch(href, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setExists(res.ok && (res.headers.get('content-type') ?? '').includes('pdf'))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [href])
  return exists
}

export default function About() {
  const { eyebrow, name, tagline, intro, cta, cv, card, roles, activity } = aboutContent
  const hasCv = useFileExists(cv.href)

  return (
    <section id="about" className={styles.about}>
      <div className={styles.inner}>
        <motion.div className={styles.copy} {...REVEAL}>
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> {eyebrow}
          </span>
          <h2 className={styles.name}>
            <RevealText lines={name} />
          </h2>
          <span className={styles.tagline}>{tagline}</span>
          {intro.map((p) => (
            <p key={p} className={styles.intro}>
              {p}
            </p>
          ))}
          <div className={styles.actions}>
            {hasCv && (
              <a className={`${styles.cta} ${styles.ctaPrimary}`} href={cv.href} download={cv.filename}>
                {cv.text}
              </a>
            )}
            <a className={styles.cta} href={cta.href} target="_blank" rel="noopener noreferrer">
              {cta.text}
            </a>
          </div>
        </motion.div>

        <div className={styles.lanyardCol}>
          <Lanyard card={card} />
        </div>

        <div className={styles.grid}>
          {roles.map((role, i) => (
            <RoleCard key={role.title} role={role} index={i} />
          ))}
          <ActivityCard activity={activity} />
        </div>
      </div>
    </section>
  )
}
