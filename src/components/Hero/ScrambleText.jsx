import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*'
const DURATION_MS = 650

const scramble = (text, resolved) =>
  [...text]
    .map((ch, i) => (i < resolved || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join('')

export default function ScrambleText({ text }) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(() => (reduce ? text : scramble(text, 0)))

  useEffect(() => {
    if (reduce) {
      setDisplay(text)
      return undefined
    }
    const start = performance.now()
    const id = setInterval(() => {
      const t = Math.min((performance.now() - start) / DURATION_MS, 1)
      setDisplay(scramble(text, Math.floor(t * text.length)))
      if (t >= 1) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [text, reduce])

  return (
    <>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </>
  )
}
