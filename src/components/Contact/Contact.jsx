import { useState } from 'react'
import { motion } from 'framer-motion'
import { spotlightMove } from '../Hero/spotlight'
import Magnetic from '../Hero/Magnetic'
import RevealText from '../Shared/RevealText'
import { contactContent } from './contactContent'
import styles from './Contact.module.css'

const REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

function Channel({ channel, index }) {
  const [copied, setCopied] = useState(false)
  const Icon = channel.icon

  async function copy() {
    try {
      await navigator.clipboard.writeText(channel.copy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked: the link itself still works */
    }
  }

  return (
    <motion.div
      className={styles.channel}
      onPointerMove={spotlightMove}
      {...REVEAL}
      transition={{ ...REVEAL.transition, delay: index * 0.08 }}
    >
      <a className={styles.channelLink} href={channel.href} target="_blank" rel="noopener noreferrer">
        <span className={styles.icon} style={{ '--brand': channel.brand }} aria-hidden="true">
          <Icon />
        </span>
        <span className={styles.channelLabel}>{channel.label}</span>
        <span className={styles.channelValue}>{channel.value}</span>
        <span className={styles.channelNote}>{channel.note}</span>
        <span className={styles.arrow} aria-hidden="true" />
      </a>
      {channel.copy && (
        <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
          {copied ? 'COPIED' : 'COPY LINK'}
        </button>
      )}
    </motion.div>
  )
}

export default function Contact() {
  const { eyebrow, title, intro, primary, channels } = contactContent

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.inner}>
        <motion.div className={styles.copyCol} {...REVEAL}>
          <span className={styles.eyebrow}>
            <span className={styles.hash}>//</span> {eyebrow}
          </span>
          <h2 className={styles.title}>
            <RevealText lines={title} />
          </h2>
          <p className={styles.intro}>{intro}</p>
          <Magnetic strength={0.25}>
            <a className={styles.primary} href={primary.href} target="_blank" rel="noopener noreferrer">
              {primary.text}
            </a>
          </Magnetic>
        </motion.div>

        <div className={styles.channels}>
          {channels.map((channel, i) => (
            <Channel key={channel.label} channel={channel} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
