import { useGithub } from '../../data/GithubProvider'
import styles from './DataSource.module.css'

// Tells the visitor whether the numbers on screen are live or the bundled snapshot.
export default function DataSource() {
  const { status, updated } = useGithub()
  const label = {
    snapshot: `SNAPSHOT FROM ${updated}`,
    loading: 'FETCHING LATEST FROM GITHUB',
    live: 'LIVE FROM GITHUB',
    offline: `GITHUB UNREACHABLE, SHOWING SNAPSHOT FROM ${updated}`,
  }[status]

  return (
    <span className={styles.badge} data-status={status} role="status">
      <i aria-hidden="true" />
      {label}
    </span>
  )
}
