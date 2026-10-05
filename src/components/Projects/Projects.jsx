import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDate, GROUPS, LANG_COLOR, REPO_URL } from '../../data/githubStats'
import { useGithub } from '../../data/GithubProvider'
import DataSource from '../Shared/DataSource'
import RevealText from '../Shared/RevealText'
import styles from './Projects.module.css'

const PAGE = 20
const GROUP_BY_ID = Object.fromEntries(GROUPS.map((g) => [g.id, g]))
const SORTS = [
  { id: 'new', label: 'NEWEST', fn: (a, b) => b.date.localeCompare(a.date) },
  { id: 'old', label: 'OLDEST', fn: (a, b) => a.date.localeCompare(b.date) },
  { id: 'az', label: 'A TO Z', fn: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) },
]

export default function Projects() {
  const { repos, total, groupCount } = useGithub()
  const [group, setGroup] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('new')
  const [shown, setShown] = useState(PAGE)

  const live = useMemo(() => repos.filter((r) => r.live).sort((a, b) => b.date.localeCompare(a.date)), [repos])
  const filters = useMemo(
    () => [{ id: 'all', label: 'ALL', count: total }, ...GROUPS.map((g) => ({ ...g, count: groupCount(g.id) }))],
    [total, groupCount],
  )
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorter = SORTS.find((s) => s.id === sort).fn
    return repos
      .filter((r) => group === 'all' || r.groups.includes(group))
      .filter((r) => !q || `${r.name} ${r.desc || ''} ${r.lang || ''}`.toLowerCase().includes(q))
      .sort(sorter)
  }, [repos, group, query, sort])

  const visible = list.slice(0, shown)
  const change = (setter) => (value) => {
    setter(value)
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
          <div>
            <h2 className={styles.title}>
              <RevealText lines={['EVERY', 'REPOSITORY']} />
            </h2>
            <DataSource />
          </div>
          <dl className={styles.figures}>
            <div>
              <dt>PUBLIC REPOSITORIES</dt>
              <dd>{total}</dd>
            </div>
            <div>
              <dt>WITH A LIVE DEMO</dt>
              <dd>{live.length}</dd>
            </div>
          </dl>
        </motion.header>

        {live.length > 0 && (
          <div className={styles.liveBlock}>
            <h3 className={styles.blockTitle}>LIVE DEMOS</h3>
            <ul className={styles.live}>
              {live.map((r, i) => (
                <motion.li
                  key={r.name}
                  className={styles.liveCard}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: 'easeOut' }}
                >
                  <span className={styles.liveMeta}>
                    {formatDate(r.date)}
                    {r.lang && ` / ${r.lang}`}
                  </span>
                  <h4 className={styles.liveName}>{r.name}</h4>
                  <a className={styles.liveOpen} href={r.live} target="_blank" rel="noopener noreferrer">
                    {r.live.replace('https://', '')}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.indexBlock}>
          <h3 className={styles.blockTitle}>ALL REPOSITORIES</h3>

          <div className={styles.controls}>
            <label className={styles.search}>
              <span className="sr-only">Search repositories</span>
              <input
                type="search"
                value={query}
                maxLength={40}
                placeholder="Search by name, language or keyword"
                onChange={(e) => change(setQuery)(e.target.value)}
              />
            </label>
            <div className={styles.sorts} role="group" aria-label="Sort">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={s.id === sort}
                  className={`${styles.sort} ${s.id === sort ? styles.sortActive : ''}`}
                  onClick={() => change(setSort)(s.id)}
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
                onClick={() => change(setGroup)(f.id)}
                className={`${styles.filter} ${f.id === group ? styles.filterActive : ''}`}
              >
                {f.label} <span className={styles.filterCount}>{f.count}</span>
              </button>
            ))}
          </div>

          <p className={styles.status} aria-live="polite">
            Showing {visible.length} of {list.length}
          </p>

          {list.length === 0 ? (
            <p className={styles.empty}>No repository matches that search. Try a shorter keyword or another group.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.colDate}>
                    DATE
                  </th>
                  <th scope="col">REPOSITORY</th>
                  <th scope="col" className={styles.colLang}>
                    LANGUAGE
                  </th>
                  <th scope="col" className={styles.colGroups}>
                    GROUPS
                  </th>
                  <th scope="col" className={styles.colLinks}>
                    LINKS
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r, i) => (
                  <tr key={r.name} style={{ animationDelay: `${(i % PAGE) * 18}ms` }}>
                    <td className={styles.colDate}>{formatDate(r.date)}</td>
                    <td>
                      <a className={styles.name} href={`${REPO_URL}${r.name}`} target="_blank" rel="noopener noreferrer">
                        {r.name}
                      </a>
                      <span className={styles.stackedDate}>{formatDate(r.date)}</span>
                      {r.desc && <span className={styles.rowDesc}>{r.desc}</span>}
                    </td>
                    <td className={styles.colLang}>
                      {r.lang && (
                        <span className={styles.lang}>
                          <i style={{ background: LANG_COLOR[r.lang] || '#8d93a0' }} aria-hidden="true" />
                          {r.lang}
                        </span>
                      )}
                    </td>
                    <td className={styles.colGroups}>{r.groups.map((g) => GROUP_BY_ID[g].label).join(', ')}</td>
                    <td className={styles.colLinks}>
                      {r.live && (
                        <a className={styles.liveLink} href={r.live} target="_blank" rel="noopener noreferrer">
                          LIVE
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {list.length > shown && (
            <button type="button" className={styles.more} onClick={() => setShown((n) => n + PAGE)}>
              SHOW {Math.min(PAGE, list.length - shown)} MORE
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
