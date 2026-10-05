import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useProgress } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen({ onLoaded }) {
  const { progress, active } = useProgress()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (progress >= 100 && !active && !done) {
      const t = setTimeout(() => {
        setDone(true)
        onLoaded?.()
      }, 350)
      return () => clearTimeout(t)
    }
  }, [progress, active, done, onLoaded])

  // Portalled to <body>: inside the Hero layer it would sit under the later layers (and a
  // transformed ancestor breaks position: fixed), so a reload mid-page never showed it.
  return createPortal(
    <AnimatePresence>
      {!done && (
        <motion.div className={styles.overlay} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
          <img src="/images/decor/sphere-wire-large.png" alt="" aria-hidden="true" className={styles.spinner} />
          <p className={styles.label}>
            <span className={styles.bracket}>//</span>LOADING SYSTEM
          </p>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className={styles.percent}>{Math.round(Math.min(progress, 100))}%</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
