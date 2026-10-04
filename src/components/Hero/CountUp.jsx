import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'

export default function CountUp({ value, delay = 0, duration = 0.9 }) {
  const reduce = useReducedMotion()
  const count = useMotionValue(reduce ? value : 0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    if (reduce) {
      count.set(value)
      return undefined
    }
    const controls = animate(count, value, { duration, delay, ease: 'easeOut' })
    return () => controls.stop()
  }, [value, delay, duration, reduce, count])

  return <motion.span>{rounded}</motion.span>
}
