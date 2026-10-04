import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import styles from './RevealText.module.css'

// Observe the mask, not the sliding line: the line starts clipped by the mask,
// so it would never count as "in view" on its own.
function RevealLine({ text, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <span ref={ref} className={styles.mask}>
      <motion.span
        className={styles.line}
        initial={{ y: '115%' }}
        animate={{ y: inView ? 0 : '115%' }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </span>
  )
}

// Each line slides up out of its own mask when it scrolls into view.
export default function RevealText({ lines, delay = 0 }) {
  return lines.map((line, i) => <RevealLine key={line} text={line} delay={delay + i * 0.1} />)
}
