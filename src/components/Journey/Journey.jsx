import { useRef } from 'react'
import { motion, useInView, useScroll, useSpring } from 'framer-motion'
import { formatDate, formatMonth, REPO_URL } from '../../data/githubStats'
import { useGithub } from '../../data/GithubProvider'
import RevealText from '../Shared/RevealText'
import styles from './Journey.module.css'

function Milestone({ m, index }) {
  const { repos } = useGithub()
  const ref = useRef(null)
  // Lights up once its card has crossed the middle of the screen, and stays lit.
  const lit = useInView(ref, { once: true, margin: '0px 0px -45% 0px' })
  const number = repos.indexOf(m.repo) + 1

  return (
    <li ref={ref} className={`${styles.item} ${index % 2 ? styles.right : ''}`} data-lit={lit}>
      <span className={styles.node} aria-hidden="true" />
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className={styles.date}>{m.monthOnly ? formatMonth(m.date) : formatDate(m.date)}</span>
        <h3 className={styles.cardTitle}>{m.title}</h3>
        <p className={styles.text}>{m.text}</p>
        <a className={styles.repo} href={`${REPO_URL}${m.repo.name}`} target="_blank" rel="noopener noreferrer">
          {m.repo.name}
        </a>
        <span className={styles.number}>REPO {number}</span>
      </motion.article>
    </li>
  )
}

export default function Journey() {
  const { milestones, total } = useGithub()
  const listRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.7', 'end 0.55'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  return (
    <section id="journey" className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> JOURNEY
          </span>
          <h2 className={styles.title}>
            <RevealText lines={['FROM REPO 1', `TO REPO ${total}`]} />
          </h2>
          <p className={styles.intro}>
            Every milestone below is a real repository, placed by the date it was created on GitHub. Scroll to follow the line.
          </p>
        </motion.header>

        <div ref={listRef} className={styles.timeline}>
          <div className={styles.rail} aria-hidden="true">
            <motion.div className={styles.railFill} style={{ scaleY: fill }} />
          </div>
          <ol className={styles.list}>
            {milestones.map((m, i) => (
              <Milestone key={m.title} m={m} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
