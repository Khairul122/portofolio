import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatDate, GROUPS, LANG_COLOR, REPO_URL } from '../../data/githubStats'
import { useGithub } from '../../data/GithubProvider'
import DataSource from '../Shared/DataSource'
import { spotlightMove } from '../Hero/spotlight'
import RevealText from '../Shared/RevealText'
import styles from './Projects.module.css'

const PAGE = 9
const SORTS = [
  { id: 'new', label: 'NEWEST', fn: (a, b) => b.date.localeCompare(a.date) },
  { id: 'old', label: 'OLDEST', fn: (a, b) => a.date.localeCompare(b.date) },
  { id: 'live', label: 'LIVE DEMO FIRST', fn: (a, b) => Number(Boolean(b.live)) - Number(Boolean(a.live)) || b.date.localeCompare(a.date) },
]
const GROUP_BY_ID = Object.fromEntries(GROUPS.map((g) => [g.id, g]))

export default function Projects() {
  const { repos, total, liveCount, groupCount } = useGithub()
  const filters = useMemo(() => [{ id: 'all', label: 'ALL', count: total }, ...GROUPS.map((g) => ({ ...g, count: groupCount(g.id) }))], [total, groupCount])
  const [group, setGroup] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('new')
  const [shown, setShown] = useState(PAGE)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorter = SORTS.find((s) => s.id === sort).fn
    return repos
      .filter((r) => group === 'all' || r.groups.includes(group))
      .filter((r) => !q || `${r.name} ${r.title} ${r.desc || ''} ${r.lang || ''}`.toLowerCase().includes(q))
      .sort(sorter)
  }, [repos, group, query, sort])

  const visible = list.slice(0, shown)
  const reset = (fn) => (value) => {
    fn(value)
    setShown(PAGE)
  }

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.inner}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> PROJECTS
          </span>
          <h2 className={styles.title}>
            <RevealText lines={['EVERY REPO,', 'ONE PLACE']} />
          </h2>
          <p className={styles.intro}>
            All {total} public repositories, searchable and filterable. {liveCount} of them have a live demo you can open.
          </p>

          <DataSource />

          <div className={styles.controls}>
            <label className={styles.search}>
              <span className="sr-only">Search repositories</span>
              <input
                type="search"
                value={query}
                maxLength={40}
                placeholder="Search by name, language or keyword"
                onChange={(e) => reset(setQuery)(e.target.value)}
              />
            </label>
            <div className={styles.sorts} role="group" aria-label="Sort">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={s.id === sort}
                  className={`${styles.sort} ${s.id === sort ? styles.sortActive : ''}`}
                  onClick={() => reset(setSort)(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filters} role="group" aria-label="Filter by group">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={f.id === group}
                onClick={() => reset(setGroup)(f.id)}
                className={`${styles.filter} ${f.id === group ? styles.filterActive : ''}`}
              >
                {f.id === group && (
                  <motion.span
                    layoutId="project-filter-pill"
                    className={styles.filterPill}
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className={styles.filterLabel}>
                  {f.label} <span className={styles.filterCount}>{f.count}</span>
                </span>
              </button>
            ))}
          </div>
        </motion.header>

        <p className={styles.status} aria-live="polite">
          Showing {visible.length} of {list.length}
        </p>

        {list.length === 0 ? (
          <p className={styles.empty}>No repository matches that search. Try a shorter keyword.</p>
        ) : (
          <motion.div layout className={styles.grid}>
            <AnimatePresence mode="popLayout">
              {visible.map((r, i) => (
                <motion.article
                  key={r.name}
                  layout
                  initial={{ opacity: 0, y: 36, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: Math.min(i % PAGE, 8) * 0.04, ease: 'easeOut' }}
                  className={styles.card}
                  onPointerMove={spotlightMove}
                >
                  <div className={styles.meta}>
                    <span>{formatDate(r.date)}</span>
                    {r.live && <span className={styles.liveBadge}>LIVE</span>}
                  </div>
                  <h3 className={styles.cardTitle}>{r.title}</h3>
                  <code className={styles.repoName}>{r.name}</code>
                  {r.desc && <p className={styles.desc}>{r.desc}</p>}
                  <div className={styles.tags}>
                    {r.lang && (
                      <span className={styles.lang}>
                        <i style={{ background: LANG_COLOR[r.lang] || '#6b7280' }} aria-hidden="true" />
                        {r.lang}
                      </span>
                    )}
                    {r.groups.map((g) => (
                      <span key={g} className={styles.tag} style={{ '--tag': GROUP_BY_ID[g].color }}>
                        {GROUP_BY_ID[g].label}
                      </span>
                    ))}
                  </div>
                  <div className={styles.links}>
                    <a href={`${REPO_URL}${r.name}`} target="_blank" rel="noopener noreferrer">
                      REPOSITORY
                    </a>
                    {r.live && (
                      <a href={r.live} target="_blank" rel="noopener noreferrer" className={styles.liveLink}>
                        LIVE DEMO
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {list.length > shown && (
          <button type="button" className={styles.more} onClick={() => setShown((n) => n + PAGE)}>
            SHOW {Math.min(PAGE, list.length - shown)} MORE
          </button>
        )}
      </div>
    </section>
  )
}
