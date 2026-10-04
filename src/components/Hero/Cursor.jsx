import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import styles from './Cursor.module.css'

// Trailing ring only: the native cursor stays visible for usability.
export default function Cursor() {
  const reduce = useReducedMotion()
  const [fine] = useState(() => window.matchMedia('(pointer: fine)').matches)
  const [over, setOver] = useState(false)
  const [visible, setVisible] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.4 })

  useEffect(() => {
    if (!fine || reduce) return undefined
    function handleMove(e) {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      setOver(Boolean(e.target.closest?.('button, a')))
    }
    const hide = () => setVisible(false)
    window.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerleave', hide)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerleave', hide)
    }
  }, [fine, reduce, x, y])

  if (!fine || reduce) return null

  return (
    <motion.div
      aria-hidden="true"
      className={styles.ring}
      style={{ x: sx, y: sy }}
      animate={{ scale: over ? 1.8 : 1, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    />
  )
}
