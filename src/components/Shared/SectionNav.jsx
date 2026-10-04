import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { scrollToLayer } from './scrollToLayer'
import { SECTIONS } from './sections'
import styles from './SectionNav.module.css'


export default function SectionNav() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState('hero')
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  // Active section = the last one whose top has passed the viewport midline.
  useEffect(() => {
    function update() {
      const mid = window.innerHeight * 0.5
      let current = SECTIONS[0].id
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= mid) current = id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  function go(id) {
    scrollToLayer(id, reduce)
  }

  return (
    <>
      <motion.div className={styles.progress} style={{ scaleX: progress }} aria-hidden="true" />
      <nav className={styles.nav} aria-label="Sections">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-label={`Go to ${label}`}
            aria-current={active === id ? 'true' : undefined}
            onClick={() => go(id)}
            className={`${styles.item} ${active === id ? styles.itemActive : ''}`}
          >
            <span className={styles.label}>{label}</span>
            <span className={styles.dot} />
          </button>
        ))}
      </nav>
    </>
  )
}
