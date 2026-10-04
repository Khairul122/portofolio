import { useContext, useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { CoveredContext } from '../Shared/CoveredContext'
import styles from './Particles.module.css'

export default function Particles({ count = 28 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const covered = useContext(CoveredContext)

  useEffect(() => {
    if (reduce || covered) return undefined
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = 1
    let w = 0
    let h = 0
    let raf = 0
    let t = 0

    function resize() {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const motes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(Math.random() * 0.25 + 0.05),
      a: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }))

    function frame() {
      t += 0.016
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        m.x += m.vx + Math.sin(t + m.phase) * 0.1
        m.y += m.vy
        if (m.y < -4) m.y = h + 4
        if (m.x < -4) m.x = w + 4
        if (m.x > w + 4) m.x = -4
        const alpha = m.a * (0.6 + 0.4 * Math.sin(t * 1.5 + m.phase))
        ctx.fillStyle = `rgba(255, 244, 235, ${alpha})`
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    // Only animate while the hero is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf)
      if (entry.isIntersecting) frame()
    })
    observer.observe(canvas)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [count, reduce, covered])

  if (reduce) return null
  return <canvas ref={ref} className={styles.particles} aria-hidden="true" />
}
