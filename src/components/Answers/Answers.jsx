import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { contactContent } from '../Contact/contactContent'
import { formatDate, GROUPS, REPO_URL } from '../../data/githubStats'
import { useGithub } from '../../data/GithubProvider'
import RevealText from '../Shared/RevealText'
import styles from './Answers.module.css'

function Bars({ rows, peak }) {
  const max = Math.max(...rows.map((r) => r.count))
  return (
    <ul className={styles.bars}>
      {rows.map((r) => (
        <li key={r.label} data-peak={r.count === peak}>
          <span className={styles.barLabel}>{r.label}</span>
          <span className={styles.barTrack}>
            <i style={{ '--w': `${(r.count / max) * 100}%` }} />
          </span>
          <span className={styles.barValue}>{r.count}</span>
        </li>
      ))}
    </ul>
  )
}

const RepoLink = ({ r }) => (
  <a href={`${REPO_URL}${r.name}`} target="_blank" rel="noopener noreferrer">
    {r.name}
  </a>
)

function Search() {
  const { repos } = useGithub()
  const [word, setWord] = useState('')
  const q = word.trim().toLowerCase()
  const hits = q ? repos.filter((r) => r.name.toLowerCase().includes(q)) : []
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className={styles.searchLabel}>
        Type a word, for example parking or flutter
      </label>
      <input id={id} className={styles.search} type="search" value={word} maxLength={30} onChange={(e) => setWord(e.target.value)} />
      <div aria-live="polite">
        {q && hits.length === 0 && <p className={styles.note}>No repository name contains "{word.trim().slice(0, 30)}".</p>}
        {hits.length > 0 && (
          <>
            <p className={styles.note}>
              {hits.length} {hits.length === 1 ? 'repository' : 'repositories'}
              {hits.length > 8 && ', showing the newest 8'}
            </p>
            <ul className={styles.links}>
              {hits
                .slice(-8)
                .reverse()
                .map((r) => (
                  <li key={r.name}>
                    <RepoLink r={r} />
                    <span>{formatDate(r.date)}</span>
                  </li>
                ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

// Every answer is drawn from the live GitHub data, so it stays true as repos are added.
const QUESTIONS = [
  {
    q: 'What do I build with most?',
    answer: (g) => (
      <>
        <p className={styles.lead}>
          {g.languages[0].label} leads, in {g.languages[0].count} of {g.total} repositories.
        </p>
        <Bars rows={g.languages.slice(0, 6)} peak={g.languages[0].count} />
      </>
    ),
  },
  {
    q: 'Which projects can I open right now?',
    answer: (g) => {
      const live = g.repos.filter((r) => r.live).reverse()
      return (
        <>
          <p className={styles.lead}>{live.length} repositories have a live demo.</p>
          <ul className={styles.links}>
            {live.map((r) => (
              <li key={r.name}>
                <a href={r.live} target="_blank" rel="noopener noreferrer">
                  {r.live.replace('https://', '')}
                </a>
                <span>{r.name}</span>
              </li>
            ))}
          </ul>
        </>
      )
    },
  },
  {
    q: 'When did I write the most?',
    answer: (g) => {
      const best = g.years.reduce((a, b) => (b.count > a.count ? b : a))
      return (
        <>
          <p className={styles.lead}>
            {best.label} was the busiest year, with {best.count} new repositories.
          </p>
          <Bars rows={g.years} peak={best.count} />
        </>
      )
    },
  },
  {
    q: 'What was the first repository, and the newest?',
    answer: (g) => {
      const first = g.repos[0]
      const last = g.repos.at(-1)
      return (
        <ul className={styles.links}>
          <li>
            <RepoLink r={first} />
            <span>FIRST, {formatDate(first.date)}</span>
          </li>
          <li>
            <RepoLink r={last} />
            <span>NEWEST, {formatDate(last.date)}</span>
          </li>
        </ul>
      )
    },
  },
  {
    q: 'How is the work split?',
    answer: (g) => {
      const rows = GROUPS.map((x) => ({ label: x.label, count: g.groupCount(x.id) }))
      return (
        <>
          <p className={styles.lead}>Grouped by language and repository name. A repository can sit in more than one group.</p>
          <Bars rows={rows} peak={Math.max(...rows.map((r) => r.count))} />
        </>
      )
    },
  },
  { q: 'Have I built something about...?', answer: () => <Search /> },
  {
    q: 'Where can I be reached?',
    answer: () => (
      <ul className={styles.links}>
        {contactContent.channels.map((c) => (
          <li key={c.label}>
            <a href={c.href} target="_blank" rel="noopener noreferrer">
              {c.note}
            </a>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    ),
  },
]

export default function Answers() {
  const github = useGithub()
  const [open, setOpen] = useState(0)

  return (
    <section id="answers" className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className={styles.title}>
            <RevealText lines={['QUICK', 'ANSWERS']} />
          </h2>
          <p className={styles.intro}>
            Questions a visitor might have about my work, answered from my GitHub data instead of a paragraph of self-description.
          </p>
        </motion.header>

        <ol className={styles.list}>
          {QUESTIONS.map((item, i) => {
            const on = i === open
            return (
              <motion.li
                key={item.q}
                className={styles.item}
                data-open={on}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
              >
                <h3>
                  <button
                    type="button"
                    id={`answer-tab-${i}`}
                    className={styles.question}
                    aria-expanded={on}
                    aria-controls={`answer-panel-${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                  >
                    <span className={styles.num}>0{i + 1}</span>
                    <span className={styles.qText}>{item.q}</span>
                    <span className={styles.toggle} aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`answer-panel-${i}`}
                      role="region"
                      aria-labelledby={`answer-tab-${i}`}
                      className={styles.panel}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      <div className={styles.answer}>{item.answer(github)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
