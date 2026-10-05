import { createContext, useContext, useEffect, useState } from 'react'
import { mapRepos } from './mapRepos'
import { buildStats, snapshotStats, SNAPSHOT_DATE, USER } from './githubStats'

// 'snapshot' = bundled data, 'loading' = fetching, 'live' = fresh from GitHub, 'offline' =
// the fetch failed (network, or the unauthenticated API limit of 60 requests an hour per IP)
// and the bundled snapshot stays on screen.
const GithubContext = createContext({ ...snapshotStats, status: 'snapshot', updated: SNAPSHOT_DATE })

export const useGithub = () => useContext(GithubContext)

let pending // one request chain per page load, even under StrictMode

function fetchLive() {
  pending ??= (async () => {
    const all = []
    for (let page = 1; page <= 6; page++) {
      const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&page=${page}`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) throw new Error(`GitHub API ${res.status}`)
      const batch = await res.json()
      all.push(...batch)
      if (batch.length < 100) break
    }
    const rows = mapRepos(all)
    if (!rows.length) throw new Error('empty repo list')
    return rows
  })().catch((error) => {
    pending = undefined // allow a retry on the next visit to the page
    throw error
  })
  return pending
}

// Shows the bundled snapshot immediately, then swaps in live data once the first
// data section is about to scroll into view. Nothing is fetched for visitors who
// never get there.
export function GithubProvider({ children }) {
  const [state, setState] = useState({ ...snapshotStats, status: 'snapshot', updated: SNAPSHOT_DATE })

  useEffect(() => {
    const target = document.getElementById('projects')
    if (!target) return
    let cancelled = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setState((s) => ({ ...s, status: 'loading' }))
        fetchLive()
          .then((rows) => {
            if (!cancelled) setState({ ...buildStats(rows), status: 'live', updated: new Date().toISOString().slice(0, 10) })
          })
          .catch(() => {
            if (!cancelled) setState((s) => ({ ...s, status: 'offline' }))
          })
      },
      { rootMargin: '800px 0px' },
    )
    observer.observe(target)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  return <GithubContext.Provider value={state}>{children}</GithubContext.Provider>
}
