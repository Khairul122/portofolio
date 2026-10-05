import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import CountUp from '../Hero/CountUp'
import { useGithub } from '../../data/GithubProvider'
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

// One row per kind of work, the number is the real repo count for that group.
function LedgerRow({ role, count }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <motion.li
      ref={ref}
      className={styles.row}
      style={{ '--accent': role.accent }}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <span className={styles.count}>{inView ? <CountUp value={count} /> : 0}</span>
      <div className={styles.rowMain}>
        <h3 className={styles.roleTitle}>{role.title}</h3>
        <p className={styles.desc}>{role.desc}</p>
      </div>
      <p className={styles.examples}>{role.examples}</p>
    </motion.li>
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
  const { eyebrow, name, tagline, intro, cta, cv, card, roles } = aboutContent
  const hasCv = useFileExists(cv.href)
  // Same source as every other section, so the numbers never disagree.
  const { sinceYear, total, groupCount } = useGithub()

  const dynamicIntro = intro.map((p) =>
    p.replace(/\d+\s+public repositories/i, `${total} public repositories`)
  )
  const dynamicCard = {
    ...card,
    since: `GITHUB SINCE ${sinceYear}`,
  }

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
          {dynamicIntro.map((p) => (
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
          <Lanyard card={dynamicCard} />
        </div>

        <div className={styles.ledger}>
          <h3 className={styles.ledgerTitle}>WHERE THE REPOSITORIES GO</h3>
          <ol className={styles.rows}>
            {roles.map((role) => (
              <LedgerRow key={role.title} role={role} count={groupCount(role.group)} />
            ))}
          </ol>
          <p className={styles.ledgerNote}>A repository can count in more than one row, for example a Laravel API is both web and backend.</p>
        </div>
      </div>
    </section>
  )
}
