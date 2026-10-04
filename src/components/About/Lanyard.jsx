import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import styles from './Lanyard.module.css'

const ROD = 250 // resting strap length in px
const MAX_STRETCH = 230 // rubber-band ceiling for the extra length
const DEG = 180 / Math.PI

// The card hangs from an elastic strap anchored at the top of the stage. The
// attach point is described by an angle and a stretch (extra strap length).
// Dragging pulls the strap longer (rubber-band, it also narrows); releasing
// springs both back with the pointer's own velocity, so a pull-down overshoots
// upward and a sideways flick swings out. The card lags behind the strap.
export default function Lanyard({ card }) {
  const reduce = useReducedMotion()
  const stageRef = useRef(null)
  const controls = useRef(null)
  const grab = useRef({ x: 0, y: 0 })
  const [flipped, setFlipped] = useState(false)
  const [grabbing, setGrabbing] = useState(false)

  const angle = useMotionValue(0)
  const stretch = useMotionValue(0)
  const sway = useMotionValue(0)
  const len = useTransform(stretch, (s) => ROD + Math.max(-70, s))
  const strapScale = useTransform(len, (l) => Math.max(0.5, Math.min(1.08, ROD / l)))
  const total = useTransform([angle, sway], ([a, s]) => a + s)
  const rodDeg = useTransform(total, (t) => -t * DEG)
  const lag = useSpring(total, { stiffness: 70, damping: 8, mass: 0.6 })
  const cardDeg = useTransform([total, lag], ([t, l]) => (t - l) * DEG)

  useEffect(() => {
    if (reduce) return undefined
    const idle = animate(sway, [0.035, -0.035], {
      duration: 3.2,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    })
    return () => idle.stop()
  }, [reduce, sway])

  const clientPoint = (info) => ({ x: info.point.x - window.scrollX, y: info.point.y - window.scrollY })

  function attachPoint(rect) {
    const r = ROD + Math.max(0, stretch.get())
    const a = angle.get()
    return { x: rect.left + rect.width / 2 + r * Math.sin(a), y: rect.top + r * Math.cos(a) }
  }

  function handlePanStart(_, info) {
    controls.current?.forEach((c) => c.stop())
    setGrabbing(true)
    const rect = stageRef.current.getBoundingClientRect()
    const p = clientPoint(info)
    const at = attachPoint(rect)
    grab.current = { x: p.x - at.x, y: p.y - at.y } // keep the spot you grabbed under the pointer
  }

  function handlePan(_, info) {
    const rect = stageRef.current.getBoundingClientRect()
    const p = clientPoint(info)
    const tx = p.x - grab.current.x - (rect.left + rect.width / 2)
    const ty = Math.max(p.y - grab.current.y - rect.top, 30)
    const limit = rect.width < 500 ? 0.55 : 1.05
    const extra = Math.hypot(tx, ty) - ROD

    angle.set(Math.max(-limit, Math.min(limit, Math.atan2(tx, ty))))
    // soft ceiling: the further you pull, the harder the strap resists
    stretch.set(extra > 0 ? MAX_STRETCH * (1 - Math.exp(-extra / MAX_STRETCH)) : 0)
  }

  function handlePanEnd(_, info) {
    setGrabbing(false)
    const a = angle.get()
    const clamp = (v, m) => Math.max(-m, Math.min(m, v))
    const radius = ROD + Math.max(0, stretch.get())
    const omega = clamp((info.velocity.x * Math.cos(a) - info.velocity.y * Math.sin(a)) / radius, 9)
    const radial = clamp(info.velocity.x * Math.sin(a) + info.velocity.y * Math.cos(a), 3200)

    controls.current = reduce
      ? [animate(angle, 0, { duration: 0.2 }), animate(stretch, 0, { duration: 0.2 })]
      : [
          animate(angle, 0, { type: 'spring', stiffness: 55, damping: 3.8, velocity: omega }),
          animate(stretch, 0, { type: 'spring', stiffness: 150, damping: 5, velocity: radial }),
        ]
  }

  return (
    <div ref={stageRef} className={styles.stage}>
      <motion.div className={styles.pendulum} style={{ rotate: rodDeg, height: len, originX: 0.5, originY: 0 }}>
        <motion.div className={styles.strap} style={{ scaleX: strapScale }} />
        <motion.div
          className={`${styles.cardWrap} ${grabbing ? styles.grabbing : ''}`}
          style={{ rotate: cardDeg, originX: 0.5, originY: 0 }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          onTap={() => setFlipped((f) => !f)}
        >
          <div className={styles.clip} aria-hidden="true" />
          <motion.div
            className={styles.flipper}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={`${styles.face} ${styles.front}`}>
              <div className={styles.shape}>
                <div className={styles.tickMark} />
                <div className={styles.topRow}>
                  <span className={styles.label}>{card.label}</span>
                  <span className={styles.badge}>{card.since}</span>
                </div>
                <div className={styles.photoFrame}>
                  <img src={card.photo} alt="Khairul Huda" draggable="false" className={styles.photo} />
                </div>
                <h3 className={styles.name}>
                  {card.nameLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h3>
                <span className={styles.role}>{card.role}</span>
                <span className={styles.handle}>{card.handle}</span>
              </div>
            </div>

            <div className={`${styles.face} ${styles.back}`}>
              <div className={styles.shape}>
                <span className={styles.backTitle}>
                  <span className={styles.hash}>//</span> {card.backTitle}
                </span>
                <ul className={styles.backList}>
                  {card.backRoles.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <span className={styles.handle}>{card.handle}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      <p className={styles.hint}>{card.hint}</p>
    </div>
  )
}
