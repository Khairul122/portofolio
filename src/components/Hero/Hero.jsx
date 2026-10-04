import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import AvatarCanvas, { BROOKLYN_AVATAR_URL, BUSINESS_AVATAR_URL, PINK_SHIRT_AVATAR_URL } from './AvatarCanvas'
import CharacterCard from './CharacterCard'
import Cursor from './Cursor'
import { avatarProfiles } from './heroContent'
import LoadingScreen from './LoadingScreen'
import Magnetic from './Magnetic'
import Particles from './Particles'
import PerformanceCard from './PerformanceCard'
import { scrollToLayer } from '../Shared/scrollToLayer'
import styles from './Hero.module.css'

const ROSTER = [BUSINESS_AVATAR_URL, PINK_SHIRT_AVATAR_URL, BROOKLYN_AVATAR_URL]
const CYCLE_MS = 7000

const nextInRoster = (current, step) => ROSTER[(ROSTER.indexOf(current) + step + ROSTER.length) % ROSTER.length]

export default function Hero() {
  const [ready, setReady] = useState(false)
  const [activeAvatar, setActiveAvatar] = useState(BUSINESS_AVATAR_URL)
  const [paused, setPaused] = useState(false)
  const profile = avatarProfiles[activeAvatar]
  const reduce = useReducedMotion()

  // Normalized pointer position (-1..1), smoothed with a spring so every
  // layer below eases toward the cursor instead of snapping to it.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 50, damping: 20, mass: 0.6 })
  const springY = useSpring(pointerY, { stiffness: 50, damping: 20, mass: 0.6 })

  useEffect(() => {
    if (reduce) return undefined
    function handleMove(e) {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [pointerX, pointerY, reduce])

  // Auto-cycle the roster; the timer restarts on every change (manual clicks
  // included) and holds while the pointer is over the character column.
  useEffect(() => {
    if (!ready || paused || reduce) return undefined
    const id = setTimeout(() => setActiveAvatar((cur) => nextInRoster(cur, 1)), CYCLE_MS)
    return () => clearTimeout(id)
  }, [ready, paused, reduce, activeAvatar])

  useEffect(() => {
    if (!ready) return undefined
    function handleKey(e) {
      if (e.key === 'ArrowRight') setActiveAvatar((cur) => nextInRoster(cur, 1))
      if (e.key === 'ArrowLeft') setActiveAvatar((cur) => nextInRoster(cur, -1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [ready])

  const bgX = useTransform(springX, [-1, 1], [8, -8])
  const bgY = useTransform(springY, [-1, 1], [6, -6])

  const orbLeftX = useTransform(springX, [-1, 1], [-18, 18])
  const orbLeftY = useTransform(springY, [-1, 1], [-14, 14])
  const orbRightX = useTransform(springX, [-1, 1], [18, -18])
  const orbRightY = useTransform(springY, [-1, 1], [-14, 14])

  const sparkleLeftX = useTransform(springX, [-1, 1], [-12, 12])
  const sparkleLeftY = useTransform(springY, [-1, 1], [-10, 10])

  const cardLeftRotateY = useTransform(springX, [-1, 1], [-5, 5])
  const cardLeftRotateX = useTransform(springY, [-1, 1], [4, -4])
  const cardRightRotateY = useTransform(springX, [-1, 1], [-5, 5])
  const cardRightRotateX = useTransform(springY, [-1, 1], [4, -4])

  return (
    <section id="hero" className={styles.hero} style={{ '--color-red': profile.accent }}>
      <motion.div
        className={styles.bgImage}
        style={{ backgroundImage: 'url(/images/hero-bg.webp)', x: bgX, y: bgY }}
      />
      <div className={styles.scrim} />
      <div className={styles.grain} aria-hidden="true" />
      <Cursor />

      <LoadingScreen onLoaded={() => setReady(true)} />

      {ready && (
        <>
          <Particles />
          <motion.img
            src="/images/decor/sphere-wire-large-halo.png"
            alt=""
            aria-hidden="true"
            className={`${styles.decorOrb} ${styles.decorOrbLeft}`}
            style={{ x: orbLeftX, y: orbLeftY }}
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          />
          <motion.img
            src="/images/decor/sphere-wire-moons-halo.png"
            alt=""
            aria-hidden="true"
            className={`${styles.decorOrb} ${styles.decorOrbRight}`}
            style={{ x: orbRightX, y: orbRightY }}
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          />
          <motion.img
            src="/images/decor/star-sparkle-halo.png"
            alt=""
            aria-hidden="true"
            className={`${styles.decorSparkle} ${styles.decorSparkleLeft}`}
            style={{ x: sparkleLeftX, y: sparkleLeftY }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className={styles.stage}>
            <motion.div
              className={styles.stageCard}
              style={{ rotateX: cardLeftRotateX, rotateY: cardLeftRotateY, transformPerspective: 1000 }}
            >
              <PerformanceCard data={profile.performance} delay={0.3} />
            </motion.div>

            <div className={styles.stageAvatar}>
              {!reduce && (
                <motion.span
                  key={activeAvatar}
                  aria-hidden="true"
                  className={styles.pulseRing}
                  initial={{ scaleX: 0.4, scaleY: 0.12, opacity: 0.8 }}
                  animate={{ scaleX: 1.8, scaleY: 0.6, opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              )}
              <AvatarCanvas modelUrl={activeAvatar} accent={profile.accent} live />
            </div>

            <motion.div
              className={`${styles.stageCard} ${styles.stageCardRight}`}
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
              style={{ rotateX: cardRightRotateX, rotateY: cardRightRotateY, transformPerspective: 1000 }}
            >
              <CharacterCard data={profile.character} delay={0.45} />
              <div className={styles.profileRow}>
                {ROSTER.map((url) => (
                  <Magnetic key={url}>
                    <button
                      type="button"
                      aria-label={`Show ${avatarProfiles[url].character.titleLines.join(' ')}`}
                      aria-pressed={url === activeAvatar}
                      onClick={() => setActiveAvatar(url)}
                      className={`${styles.profileBadge} ${url === activeAvatar ? styles.profileBadgeActive : ''}`}
                    >
                      <AvatarCanvas modelUrl={url} frameMargin={2.4} aimFraction={0.82} grounded={false} tilt={false} live={false} />
                    </button>
                  </Magnetic>
                ))}
              </div>
            </motion.div>
          </div>
          <button type="button" className={styles.scrollCue} onClick={() => scrollToLayer('about', reduce)}>
            <span className={styles.scrollLabel}>SCROLL</span>
            <span className={styles.scrollTrack}>
              <motion.span
                className={styles.scrollDot}
                animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
          </button>
        </>
      )}
    </section>
  )
}
