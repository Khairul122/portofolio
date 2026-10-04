import { forwardRef, useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { CoveredContext } from './CoveredContext'
import styles from './Layer.module.css'

// One full section acting as a stacked layer. It pins to the viewport (a tall
// layer pins by its bottom edge, so it still scrolls fully) and, while the next
// layer slides over it, it shrinks and darkens. When fully covered it tells its
// children so heavy work (WebGL, particles) can pause.
const Layer = forwardRef(function Layer({ id, order, nextRef, children }, ref) {
  const reduce = useReducedMotion()
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)
  const [covered, setCovered] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { scrollYProgress } = useScroll(
    nextRef ? { target: nextRef, offset: ['start end', 'start start'] } : {},
  )
  const active = Boolean(nextRef) && !reduce
  const scale = useTransform(scrollYProgress, [0, 1], active ? [1, 0.92] : [1, 1])
  const dim = useTransform(scrollYProgress, [0, 1], active ? [0, 0.6] : [0, 0])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (nextRef) setCovered(v >= 0.98)
  })

  return (
    <div
      ref={ref}
      data-layer={id}
      className={`${styles.layer} ${reduce ? styles.flat : ''}`}
      style={{ '--layer-h': `${height}px`, zIndex: order }}
    >
      <motion.div ref={contentRef} className={styles.content} style={{ scale }}>
        <CoveredContext.Provider value={covered}>{children}</CoveredContext.Provider>
        <motion.div className={styles.dim} style={{ opacity: dim }} aria-hidden="true" />
      </motion.div>
    </div>
  )
})

export default Layer
