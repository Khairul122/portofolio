import { motion } from 'framer-motion'
import CountUp from './CountUp'
import { spotlightMove } from './spotlight'
import styles from './PerformanceCard.module.css'

export default function PerformanceCard({ data, delay = 0 }) {
  const { label, badge, bars, edition } = data

  return (
    <motion.div
      className={styles.card}
      onPointerMove={spotlightMove}
      initial={{ opacity: 0, x: -40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      <div className={styles.tickMark} />

      <div className={styles.topRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.badge}>{badge}</span>
      </div>

      <div className={styles.barList}>
        {bars.map((b, i) => (
          <div key={`${edition}-${b.label}`} className={styles.barRow}>
            <span className={styles.barLabel}>{b.label}</span>
            <div className={styles.barLine}>
              <span className={styles.barValue}>
                <CountUp value={b.value} delay={delay + 0.15 * i} />
              </span>
              <div className={styles.track}>
                <motion.div
                  className={styles.fill}
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.value / b.max) * 100}%` }}
                  transition={{ duration: 0.9, delay: delay + 0.15 * i, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <span className={styles.edition}>{edition}</span>
    </motion.div>
  )
}
