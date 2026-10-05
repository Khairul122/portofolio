// Snapshots the public repositories of github.com/Khairul122 into src/data/github.json.
// The site renders this snapshot instantly and then refreshes it live from the GitHub API
// in the browser (see src/data/GithubProvider.jsx). Run `npm run data` to refresh the
// snapshot so the fallback is never far behind.
import { mkdirSync, writeFileSync } from 'node:fs'
import { mapRepos } from '../src/data/mapRepos.js'

const USER = 'Khairul122'

const repos = []
for (let page = 1; ; page++) {
  const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&page=${page}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-snapshot' },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status} on page ${page}`)
  const batch = await res.json()
  repos.push(...batch)
  if (batch.length < 100) break
}

const compact = mapRepos(repos)

mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true })
writeFileSync(
  new URL('../src/data/github.json', import.meta.url),
  `${JSON.stringify({ user: USER, fetched: new Date().toISOString().slice(0, 10), repos: compact })}\n`,
)
console.log(`Wrote src/data/github.json with ${compact.length} repos`)
