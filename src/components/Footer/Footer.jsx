import { useReducedMotion } from 'framer-motion'
import { contactContent, footerContent } from '../Contact/contactContent'
import { scrollToLayer } from '../Shared/scrollToLayer'
import { SECTIONS } from '../Shared/sections'
import styles from './Footer.module.css'

export default function Footer() {
  const reduce = useReducedMotion()
  const { name, roles, built, repo } = footerContent
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.name}>{name}</span>
          <span className={styles.roles}>{roles}</span>
        </div>

        <nav className={styles.links} aria-label="Footer">
          {SECTIONS.map(({ id, label }) => (
            <button key={id} type="button" className={styles.link} onClick={() => scrollToLayer(id, reduce)}>
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.socials}>
          {contactContent.channels.map(({ label, href, icon: Icon, brand }) => (
            <a
              key={label}
              className={styles.social}
              style={{ '--brand': brand }}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <Icon />
            </a>
          ))}
        </div>

        <button type="button" className={styles.top} onClick={() => scrollToLayer('hero', reduce)}>
          <span className={styles.topArrow} aria-hidden="true" />
          BACK TO TOP
        </button>
      </div>

      <div className={styles.bar}>
        <span>
          &copy; {year} {name}
        </span>
        <a href={repo} target="_blank" rel="noopener noreferrer">
          {built}
        </a>
      </div>
    </footer>
  )
}
