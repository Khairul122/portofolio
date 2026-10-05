// Turns the GitHub API repo list into the compact rows the site uses. Shared by the
// snapshot script (scripts/fetch-github.mjs) and the live fetch in the browser, so both
// always agree on what counts as a project.
//
// This portfolio's own repo is not a project to showcase, and the site's headline
// numbers were counted before it existed.
const EXCLUDE = new Set(['portofolio'])

export function mapRepos(apiRepos) {
  return apiRepos
    .filter((r) => !r.fork && !r.private && !EXCLUDE.has(r.name))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((r) => ({
      n: r.name,
      d: r.description || undefined,
      l: r.language || undefined,
      c: r.created_at.slice(0, 10),
      s: r.stargazers_count || undefined,
      h: r.homepage || undefined,
    }))
}
