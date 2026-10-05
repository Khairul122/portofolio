import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDate, REPO_URL } from '../../data/githubStats'
import { useGithub } from '../../data/GithubProvider'
import DataSource from '../Shared/DataSource'
import RevealText from '../Shared/RevealText'
import styles from './Heatmap.module.css'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAY = 86400000
const iso = (ms) => new Date(ms).toISOString().slice(0, 10)
const TODAY = iso(Date.now())
const level = (n) => (n === 0 ? 0 : Math.min(n, 4))

// One column per week (Sunday first), one row per weekday, like the GitHub graph.
function buildYear(year, reposByDay) {
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year, 11, 31)
  const offset = new Date(start).getUTCDay()
  const days = []
  for (let t = start; t <= end; t += DAY) {
    const date = iso(t)
    days.push({ date, count: reposByDay.get(date)?.length || 0, col: Math.floor((offset + (t - start) / DAY) / 7), row: new Date(t).getUTCDay() })
  }
  return { days, columns: days.at(-1).col + 1 }
}

function summarize(days) {
  let active = 0
  let streak = 0
  let longest = 0
  let busiest = days[0]
  for (const d of days) {
    if (d.count) {
      active += 1
      streak += 1
      longest = Math.max(longest, streak)
    } else streak = 0
    if (d.count > busiest.count) busiest = d
  }
  return { active, longest, busiest, total: days.reduce((a, d) => a + d.count, 0) }
}

export default function Heatmap() {
  const { repos, reposByDay, years } = useGithub()
  const [picked, setPicked] = useState(null)
  const year = years.some((y) => y.label === picked) ? picked : years.at(-1).label
  const setYear = setPicked
  const { days, columns } = useMemo(() => buildYear(+year, reposByDay), [year, reposByDay])
  const stats = useMemo(() => summarize(days), [days])
  const [pick, setPick] = useState({ year, date: stats.busiest.date })
  // A pick from another year falls back to this year's busiest day.
  const selected = pick.year === year ? pick.date : stats.busiest.date
  const list = reposByDay.get(selected) || []

  const choose = (date) => setPick({ year, date })
  const move = (e) => {
    const step = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = iso(Date.parse(selected) + step * DAY)
    if (next.startsWith(year)) choose(next)
  }

  const labels = days.filter((d) => d.date.endsWith('-01'))

  return (
    <section id="activity" className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> ACTIVITY
          </span>
          <h2 className={styles.title}>
            <RevealText lines={['REPOS CREATED', 'EVERY DAY']} />
          </h2>
          <p className={styles.intro}>
            Each square is one day, coloured by how many repositories I created on it. Pick a year, then hover or use the arrow keys to read a day.
          </p>
          <div className={styles.years} role="group" aria-label="Year">
            {years.map((y) => (
              <button
                key={y.label}
                type="button"
                aria-pressed={y.label === year}
                className={`${styles.year} ${y.label === year ? styles.yearActive : ''}`}
                onClick={() => setYear(y.label)}
              >
                {y.label}
                <span>{y.count}</span>
              </button>
            ))}
          </div>
        </motion.header>

        <div className={styles.summary}>
          <div>
            <strong>{stats.total}</strong>
            <span>REPOS IN {year}</span>
          </div>
          <div>
            <strong>{stats.active}</strong>
            <span>ACTIVE DAYS</span>
          </div>
          <div>
            <strong>{stats.busiest.count}</strong>
            <span>BUSIEST DAY ({formatDate(stats.busiest.date).slice(0, 6)})</span>
          </div>
          <div>
            <strong>{stats.longest}</strong>
            <span>LONGEST STREAK, DAYS</span>
          </div>
        </div>

        <div className={styles.scroller}>
          <div
            key={year}
            className={styles.graph}
            style={{ '--cols': columns }}
            role="grid"
            tabIndex={0}
            aria-label={`Repositories created per day in ${year}`}
            aria-activedescendant={`day-${selected}`}
            onKeyDown={move}
          >
            <div className={styles.months} aria-hidden="true">
              {labels.map((d) => (
                <span key={d.date} style={{ gridColumn: d.col + 1 }}>
                  {MONTHS[+d.date.slice(5, 7) - 1]}
                </span>
              ))}
            </div>
            <div className={styles.weekdays} aria-hidden="true">
              <span style={{ gridRow: 2 }}>MON</span>
              <span style={{ gridRow: 4 }}>WED</span>
              <span style={{ gridRow: 6 }}>FRI</span>
            </div>
            <div className={styles.cells}>
              {days.map((d) => (
                <div
                  key={d.date}
                  id={`day-${d.date}`}
                  role="gridcell"
                  aria-label={`${formatDate(d.date)}, ${d.count} repositories`}
                  aria-selected={d.date === selected}
                  data-level={d.date > TODAY ? 'future' : level(d.count)}
                  data-selected={d.date === selected}
                  className={styles.cell}
                  style={{ gridColumn: d.col + 1, gridRow: d.row + 1, animationDelay: `${d.col * 9}ms` }}
                  onPointerEnter={() => choose(d.date)}
                  onClick={() => choose(d.date)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.legend} aria-hidden="true">
          LESS
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} data-level={l} />
          ))}
          MORE
        </div>

        <div className={styles.detail} aria-live="polite">
          <strong>{formatDate(selected)}</strong>
          {list.length === 0 ? (
            <p>No repository was created on this day.</p>
          ) : (
            <ul>
              {list.map((r) => (
                <li key={r.name}>
                  <a href={`${REPO_URL}${r.name}`} target="_blank" rel="noopener noreferrer">
                    {r.name}
                  </a>
                  {r.lang && <span>{r.lang}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className={styles.note}>
          Counts repositories created per day from the public GitHub repository list ({repos.length} in total), not commits.
        </p>
        <DataSource />
      </div>
    </section>
  )
}
