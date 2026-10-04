import { useContext, useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import RevealText from '../Shared/RevealText'
import { CoveredContext } from '../Shared/CoveredContext'
import styles from './IntroVideo.module.css'

// Chapter starts match the scene lengths in video/data.js (30 fps).
const DURATION = 25
const CHAPTERS = [
  { start: 0, title: 'WHO I AM', info: 'Khairul Huda, a web, Android and SaaS developer.' },
  { start: 3.7, title: 'MY GITHUB', info: '203 public repositories since 2021, no forks, 15 languages.' },
  { start: 9, title: 'THREE ROLES', info: '154 web, 14 Android and 12 SaaS repositories.' },
  { start: 16, title: 'HOW IT GREW', info: '2024 was the peak with 79 new repositories.' },
  { start: 21, title: 'SAY HELLO', info: 'LinkedIn, Instagram and GitHub, all in one place.' },
]

const content = {
  eyebrow: 'INTRO VIDEO',
  title: ['MEET', 'KHAIRUL'],
  intro: 'A 25 second tour of who I am and what my GitHub shows. Pick a chapter to jump to it.',
  alt: 'Animated introduction of Khairul Huda, showing his GitHub with 203 public repositories, his three roles and contact handles. No audio.',
}

const clock = (s) => `0:${String(Math.floor(s)).padStart(2, '0')}`

export default function IntroVideo() {
  const frameRef = useRef(null)
  const videoRef = useRef(null)
  const [time, setTime] = useState(0)
  const covered = useContext(CoveredContext)
  const reduced = useReducedMotion()
  // Nothing is fetched until the section is close to the viewport.
  const near = useInView(frameRef, { once: true, margin: '400px 0px' })
  const visible = useInView(frameRef, { amount: 0.4 })

  useEffect(() => {
    const video = videoRef.current
    if (!video || !near) return
    if (visible && !covered && !reduced) video.play().catch(() => {})
    else video.pause()
  }, [near, visible, covered, reduced])

  const active = CHAPTERS.findLastIndex((c) => time >= c.start)

  const jump = (start) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = start
    video.play().catch(() => {})
  }

  return (
    <section id="intro" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className={styles.eyebrow}>
              <span className={styles.hash}>//</span> {content.eyebrow}
            </span>
            <h2 className={styles.title}>
              <RevealText lines={content.title} />
            </h2>
            <p className={styles.intro}>{content.intro}</p>
          </motion.div>

          <ol className={styles.chapters}>
            {CHAPTERS.map((c, i) => {
              const end = CHAPTERS[i + 1]?.start ?? DURATION
              const progress = i < active ? 1 : i === active ? Math.min(1, (time - c.start) / (end - c.start)) : 0
              return (
                <motion.li
                  key={c.title}
                  initial={{ opacity: 0, x: -36 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                >
                  <button
                    type="button"
                    className={`${styles.chapter} ${i === active ? styles.chapterActive : ''}`}
                    aria-current={i === active ? 'true' : undefined}
                    onClick={() => jump(c.start)}
                  >
                    <span className={styles.num}>0{i + 1}</span>
                    <span className={styles.text}>
                      <span className={styles.chTitle}>{c.title}</span>
                      <span className={styles.chInfo}>{c.info}</span>
                    </span>
                    <span className={styles.stamp}>{clock(c.start)}</span>
                    <span className={styles.bar} style={{ transform: `scaleX(${progress})` }} />
                  </button>
                </motion.li>
              )
            })}
          </ol>
        </div>

        <div className={styles.stage}>
          <div ref={frameRef} className={styles.frame}>
            {near && (
              <video
                ref={videoRef}
                className={styles.video}
                src="/video/recap-16x9.mp4"
                poster="/video/recap-16x9.jpg"
                aria-label={content.alt}
                muted
                loop
                playsInline
                controls
                preload="metadata"
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              />
            )}
          </div>
          <div className={styles.now} aria-hidden="true">
            <span className={styles.nowLabel}>NOW SHOWING</span>
            <span className={styles.nowTitle}>{CHAPTERS[Math.max(active, 0)].title}</span>
            <span className={styles.nowTime}>
              {clock(time)} / {clock(DURATION)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
