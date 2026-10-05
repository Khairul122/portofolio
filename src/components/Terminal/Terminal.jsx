import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useGithub } from '../../data/GithubProvider'
import RevealText from '../Shared/RevealText'
import { COMMANDS, execute, SUGGESTIONS } from './commands'
import styles from './Terminal.module.css'

const PROMPT = 'khairul@portfolio:~$'
const MAX_LINES = 300
const NAMES = Object.keys(COMMANDS)

function Line({ line }) {
  if (typeof line === 'string') return <>{line || ' '}</>
  return line.map((part, i) =>
    typeof part === 'string' ? (
      <span key={i}>{part}</span>
    ) : (
      <a key={i} href={part.href} target="_blank" rel="noopener noreferrer">
        {part.label}
      </a>
    ),
  )
}

export default function Terminal() {
  const github = useGithub()
  const [lines, setLines] = useState([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const history = useRef([])
  const cursor = useRef(0)
  const screen = useRef(null)
  const input = useRef(null)
  const demoDone = useRef(false)
  const reduced = useReducedMotion()
  const inView = useInView(screen, { once: true, amount: 0.5 })

  const submit = (text) => {
    const command = text.trim().slice(0, 80)
    if (!command) return
    history.current = [...history.current, command].slice(-50)
    cursor.current = history.current.length
    const out = execute(command, github)
    setLines((prev) =>
      out === null
        ? []
        : [...prev, { kind: 'in', text: command }, ...out.map((line) => ({ kind: 'out', line }))].slice(-MAX_LINES),
    )
    setValue('')
  }

  // On first view the terminal types `whoami` by itself, so it never looks empty.
  useEffect(() => {
    if (!inView || demoDone.current) return
    if (reduced) {
      demoDone.current = true
      submit('whoami')
      return
    }
    setBusy(true)
    let i = 0
    let pause
    const timer = setInterval(() => {
      i += 1
      setValue('whoami'.slice(0, i))
      if (i === 6) {
        clearInterval(timer)
        pause = setTimeout(() => {
          demoDone.current = true
          submit('whoami')
          setBusy(false)
        }, 350)
      }
    }, 110)
    return () => {
      clearInterval(timer)
      clearTimeout(pause)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced])

  useEffect(() => {
    const el = screen.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(history.current.length, Math.max(0, cursor.current + (e.key === 'ArrowUp' ? -1 : 1)))
      cursor.current = next
      setValue(history.current[next] || '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const matches = NAMES.filter((n) => n.startsWith(value.trim().toLowerCase()))
      if (value.trim() && matches.length === 1) setValue(matches[0])
    }
  }

  const run = (command) => {
    submit(command)
    input.current?.focus({ preventScroll: true })
  }

  return (
    <section id="terminal" className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> TERMINAL
          </span>
          <h2 className={styles.title}>
            <RevealText lines={['ASK ME', 'ANYTHING']} />
          </h2>
          <p className={styles.intro}>
            A small terminal that answers from my real GitHub data. Type a command, or tap one below.
          </p>
        </motion.header>

        <motion.div
          className={styles.window}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className={styles.bar}>
            <span className={styles.dots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className={styles.barTitle}>{PROMPT.slice(0, -1)}</span>
          </div>

          <div ref={screen} className={styles.screen} onClick={() => input.current?.focus({ preventScroll: true })}>
            <div className={styles.output} role="log" aria-live="polite">
              {lines.map((l, i) =>
                l.kind === 'in' ? (
                  <div key={i} className={styles.row}>
                    <span className={styles.prompt}>{PROMPT}</span> {l.text}
                  </div>
                ) : (
                  <div key={i} className={`${styles.row} ${styles.out}`} style={{ animationDelay: `${(i % 12) * 25}ms` }}>
                    <Line line={l.line} />
                  </div>
                ),
              )}
            </div>
            <form
              className={`${styles.row} ${styles.form}`}
              onSubmit={(e) => {
                e.preventDefault()
                submit(value)
              }}
            >
              <label htmlFor="terminal-input" className={styles.prompt}>
                {PROMPT}
              </label>
              <input
                id="terminal-input"
                ref={input}
                value={value}
                maxLength={80}
                readOnly={busy}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Terminal command"
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </form>
          </div>
        </motion.div>

        <div className={styles.chips} role="group" aria-label="Suggested commands">
          {SUGGESTIONS.map((c) => (
            <button key={c} type="button" className={styles.chip} onClick={() => run(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
