import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ScrambleText from './ScrambleText'
import { contactLinks, TABS } from './heroContent'
import { spotlightMove } from './spotlight'
import styles from './CharacterCard.module.css'

const FADE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
}

export default function CharacterCard({ data, delay = 0 }) {
  const { label, draft, titleLines, nickname, bio, stats, tags, about } = data
  const [tab, setTab] = useState('SKILLS')
  const role = titleLines.join('-')

  return (
    <motion.div
      className={styles.card}
      onPointerMove={spotlightMove}
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      <div className={styles.tickMark} />

      <div className={styles.topRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.draftBadge}>{draft}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={role} {...FADE}>
          <h3 className={styles.title}>
            {titleLines.map((line) => (
              <span key={line}>
                <ScrambleText text={line} />
              </span>
            ))}
          </h3>
          <span className={styles.nickname}>{nickname}</span>
          <p className={styles.bio}>{bio}</p>
        </motion.div>
      </AnimatePresence>

      <div className={styles.body}>
        <AnimatePresence mode="wait">
          <motion.div key={`${role}-${tab}`} {...FADE}>
            {tab === 'SKILLS' && (
              <div className={styles.statsRow}>
                <div className={styles.statList}>
                  {stats.map((s) => (
                    <span key={s} className={styles.statLine}>
                      {s}
                    </span>
                  ))}
                </div>
                <div className={styles.tagList}>
                  {tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {tab === 'ABOUT' && (
              <div className={styles.lineList}>
                {about.map((line) => (
                  <span key={line} className={styles.aboutLine}>
                    {line}
                  </span>
                ))}
              </div>
            )}

            {tab === 'CONTACT' && (
              <div className={styles.lineList}>
                {contactLinks.map((link) => (
                  <a
                    key={link.href}
                    className={styles.contactLink}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={t === tab}
            onClick={() => setTab(t)}
            className={`${styles.tab} ${t === tab ? styles.tabActive : ''}`}
          >
            {t === tab && (
              <motion.span
                layoutId="tab-pill"
                className={styles.tabPill}
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <span className={styles.tabLabel}>{t}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
