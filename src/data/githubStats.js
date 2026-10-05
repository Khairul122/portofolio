// Everything the data sections show is derived here from the repo list, either the bundled
// snapshot (src/data/github.json, refresh with `npm run data`) or the live GitHub API
// (src/data/GithubProvider.jsx). Both go through buildStats, so nothing is typed in by hand.
import snapshot from './github.json'

export const USER = snapshot.user
export const REPO_URL = `https://github.com/${USER}/`
export const SNAPSHOT_DATE = snapshot.fetched

const WEB_LANGS = new Set(['PHP', 'CSS', 'JavaScript', 'HTML', 'Less', 'SCSS', 'Blade', 'TypeScript'])
const MOBILE_LANGS = new Set(['Dart', 'Kotlin', 'Java'])

// A repo can belong to several groups (a Laravel API is both web and backend).
export const GROUPS = [
  { id: 'web', label: 'WEB', color: '#e8342a', test: (r) => WEB_LANGS.has(r.lang) },
  { id: 'mobile', label: 'MOBILE', color: '#14803f', test: (r) => MOBILE_LANGS.has(r.lang) },
  { id: 'backend', label: 'BACKEND', color: '#2563eb', test: (r) => /backend/i.test(r.name) },
  { id: 'iot', label: 'IOT', color: '#a16207', test: (r) => /iot|arduino/i.test(r.name) },
  {
    id: 'ai',
    label: 'AI / ML',
    color: '#7c3aed',
    test: (r) => r.lang === 'Jupyter Notebook' || /yolo|cnn|knn|lstm|svm|gmm|naive/i.test(r.name),
  },
]

export const LANG_COLOR = {
  PHP: '#e8342a',
  CSS: '#e8342a',
  JavaScript: '#e8342a',
  HTML: '#e8342a',
  TypeScript: '#e8342a',
  Blade: '#e8342a',
  Less: '#e8342a',
  SCSS: '#e8342a',
  Dart: '#14803f',
  Kotlin: '#14803f',
  Java: '#14803f',
  Python: '#7c3aed',
  'Jupyter Notebook': '#7c3aed',
  'C++': '#a16207',
  Makefile: '#a16207',
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export const formatDate = (iso) => `${iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`
export const formatMonth = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`

// "JK-WebPemesananJasaFotografer-ED" -> "Web Pemesanan Jasa Fotografer". Display only;
// the real repository name always stays visible next to it.
function pretty(name) {
  return name
    .replace(/^(JK|AST)-/i, '')
    .replace(/-ED$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

// rows: compact repos sorted by creation date (see mapRepos.js).
export function buildStats(rows) {
  const repos = rows.map((r) => {
    const base = { name: r.n, desc: r.d, lang: r.l, date: r.c, year: +r.c.slice(0, 4), stars: r.s || 0, live: r.h }
    return { ...base, title: pretty(r.n), groups: GROUPS.filter((g) => g.test(base)).map((g) => g.id) }
  })

  const tally = (key) => {
    const map = new Map()
    for (const r of repos) if (r[key]) map.set(r[key], (map.get(r[key]) || 0) + 1)
    return [...map].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
  }
  const languages = tally('lang')
  const years = [...new Set(repos.map((r) => r.year))]
    .sort()
    .map((y) => ({ label: String(y), count: repos.filter((r) => r.year === y).length }))

  const reposByDay = new Map()
  for (const r of repos) reposByDay.set(r.date, [...(reposByDay.get(r.date) || []), r])

  return {
    repos,
    total: repos.length,
    sinceYear: repos[0].year,
    liveCount: repos.filter((r) => r.live).length,
    groupCount: (id) => repos.filter((r) => r.groups.includes(id)).length,
    languages,
    languageCount: languages.length,
    years,
    reposByDay,
    milestones: buildMilestones(repos),
  }
}

// Chronological milestones, each backed by a real repository or count. A milestone whose
// repo does not exist (no Dart repo yet, say) is skipped instead of faked.
function buildMilestones(repos) {
  const first = (test) => repos.find(test)
  const months = new Map()
  for (const r of repos) months.set(r.date.slice(0, 7), (months.get(r.date.slice(0, 7)) || 0) + 1)
  const [peakMonth, peakCount] = [...months].sort((a, b) => b[1] - a[1])[0]
  const lang = (r) => r.lang || 'no detected language'
  const newest = repos.at(-1)
  const items = [
    { repo: repos[0], title: 'FIRST REPOSITORY', text: `${repos[0].name} goes public, written in ${lang(repos[0])}.` },
    { repo: first((r) => r.lang === 'PHP'), title: 'FIRST PHP PROJECT', text: 'PHP shows up for the first time. It is now the most used language across the repositories.' },
    { repo: first((r) => r.lang === 'Dart'), title: 'FIRST DART APP', text: 'The first mobile repository, written in Dart.' },
    { repo: first((r) => r.groups.includes('ai')), title: 'FIRST DATA / ML REPO', text: 'The first repository in the data and machine learning group.' },
    { repo: first((r) => r.groups.includes('backend')), title: 'FIRST BACKEND REPO', text: 'The first repository with a dedicated backend name.' },
    { repo: repos[99], title: '100TH REPOSITORY', text: `The hundredth public repository is ${repos[99]?.name}.` },
    { repo: repos[199], title: '200TH REPOSITORY', text: `Repository number 200 is ${repos[199]?.name}.` },
    { repo: newest, title: 'LATEST REPOSITORY', text: `The newest one so far is ${newest.name}.` },
    {
      repo: repos.find((r) => r.date.startsWith(peakMonth)),
      title: 'BUSIEST MONTH',
      text: `${peakCount} repositories created in a single month, the most of any month.`,
      date: `${peakMonth}-01`,
      monthOnly: true,
    },
  ]
  return items
    .filter((m) => m.repo)
    .map((m) => ({ ...m, date: m.date || m.repo.date }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export const snapshotStats = buildStats(snapshot.repos)
