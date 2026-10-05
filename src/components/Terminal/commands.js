import { contactContent } from '../Contact/contactContent'
import { GROUPS, REPO_URL } from '../../data/githubStats'

// A line is a string, or an array mixing strings and { href, label } links.
// Output is only ever rendered as React text, never as HTML.
// Every command receives g, the current GitHub data (live or snapshot).
const link = (label, href) => ({ href, label })
const bar = (n, max, width = 22) => '█'.repeat(Math.max(1, Math.round((n / max) * width)))
const pad = (s, n) => String(s).padEnd(n, ' ')
const repoLine = (r) => [`${r.date}  `, link(r.name, `${REPO_URL}${r.name}`), r.lang ? `  ${r.lang}` : '']

const barLines = (rows) => {
  const max = Math.max(...rows.map((r) => r.count))
  const w = Math.max(...rows.map((r) => r.label.length))
  return rows.map((r) => `${pad(r.label, w)}  ${bar(r.count, max)} ${r.count}`)
}

function listRepos(g, arg) {
  const key = arg.toLowerCase()
  const lang = g.languages.find((l) => l.label.toLowerCase() === key)
  const group = GROUPS.find((x) => x.id === key)
  const test = lang ? (r) => r.lang === lang.label : group ? (r) => r.groups.includes(group.id) : key === 'flutter' ? (r) => r.lang === 'Dart' : null
  if (!test) return [`No repositories for "${arg.slice(0, 24)}". Try: php, dart, python, web, mobile, backend, iot, ai.`]
  const hits = g.repos.filter(test)
  return [`${hits.length} repositories, newest first:`, ...hits.slice(-8).reverse().map(repoLine)]
}

export const COMMANDS = {
  help: {
    desc: 'list the commands',
    run: () => [
      'Available commands:',
      ...Object.entries(COMMANDS).map(([name, c]) => `  ${pad(name, 9)}${c.desc}`),
      '',
      'Use ArrowUp for history and Tab to complete.',
    ],
  },
  whoami: {
    desc: 'who I am',
    run: (_, g) => [
      'Khairul Huda',
      'Web, Android and SaaS developer.',
      `On GitHub since ${g.sinceYear}: ${g.total} public repositories, 0 forks, ${g.languageCount} languages.`,
    ],
  },
  repos: {
    desc: 'repos [php|dart|web|mobile|...]',
    run: (arg, g) =>
      arg
        ? listRepos(g, arg)
        : [`${g.total} public repositories, 0 forks, ${g.languageCount} languages, ${g.liveCount} with a live demo.`, 'Filter with: repos php, repos dart, repos backend, repos ai ...'],
  },
  stack: { desc: 'languages by repo count', run: (_, g) => barLines(g.languages.slice(0, 8)) },
  roles: { desc: 'repos per group', run: (_, g) => barLines(GROUPS.map((x) => ({ label: x.label, count: g.groupCount(x.id) }))) },
  years: { desc: 'repos created per year', run: (_, g) => barLines(g.years) },
  latest: { desc: 'five newest repos', run: (_, g) => g.repos.slice(-5).reverse().map(repoLine) },
  first: { desc: 'the very first repo', run: (_, g) => [repoLine(g.repos[0])] },
  live: {
    desc: 'repos with a live demo',
    run: (_, g) => g.repos.filter((r) => r.live).map((r) => [pad(r.name, 24), link(r.live.replace('https://', ''), r.live)]),
  },
  search: {
    desc: 'search <word> in repo names',
    run: (arg, g) => {
      if (!arg) return ['Usage: search <word>']
      const q = arg.toLowerCase()
      const hits = g.repos.filter((r) => r.name.toLowerCase().includes(q))
      return hits.length ? [`${hits.length} match(es):`, ...hits.slice(0, 8).map(repoLine)] : [`Nothing matches "${arg.slice(0, 24)}".`]
    },
  },
  contact: {
    desc: 'where to find me',
    run: () => contactContent.channels.map((c) => [pad(c.label, 10), link(c.note, c.href)]),
  },
  clear: { desc: 'clear the screen', run: () => null },
}

export const SUGGESTIONS = ['help', 'whoami', 'stack', 'roles', 'years', 'live', 'latest', 'contact']

export function execute(input, g) {
  const [name = '', ...rest] = input.trim().split(/\s+/)
  const arg = rest.join(' ')
  const cmd = name.toLowerCase()
  if (!cmd) return []
  if (cmd === 'sudo') return ['Nice try. This terminal is read only.']
  if (cmd === 'ls') return COMMANDS.repos.run(arg, g)
  if (!Object.hasOwn(COMMANDS, cmd)) return [`command not found: ${name.slice(0, 24)}. Type "help".`]
  return COMMANDS[cmd].run(arg, g)
}
