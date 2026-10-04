import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa6'

// Only real accounts. To add email, WhatsApp etc., push another entry to
// `channels` (label, value, note, href, icon, brand, optional copy).
const GITHUB = 'https://github.com/Khairul122'
const INSTAGRAM = 'https://www.instagram.com/khrl.arll1/'
const LINKEDIN = 'https://www.linkedin.com/in/khairul-huda-675824193/'

export const contactContent = {
  eyebrow: 'CONTACT ME',
  title: ['CONTACT', 'ME'],
  intro: 'For work, collaboration or just to say hi, reach me on any of these. LinkedIn is the best place for professional messages.',
  primary: { text: 'CONNECT ON LINKEDIN', href: LINKEDIN },
  channels: [
    {
      label: 'LINKEDIN',
      value: 'Khairul Huda',
      note: 'linkedin.com/in/khairul-huda-675824193',
      href: LINKEDIN,
      copy: LINKEDIN,
      icon: FaLinkedin,
      brand: '#0a66c2',
    },
    {
      label: 'INSTAGRAM',
      value: '@khrl.arll1',
      note: 'instagram.com/khrl.arll1',
      href: INSTAGRAM,
      copy: INSTAGRAM,
      icon: FaInstagram,
      brand: 'linear-gradient(45deg, #f09433, #dc2743 55%, #bc1888)',
    },
    {
      label: 'GITHUB',
      value: 'Khairul122',
      note: 'github.com/Khairul122, 203 public repositories',
      href: GITHUB,
      copy: GITHUB,
      icon: FaGithub,
      brand: '#15181d',
    },
  ],
}

export const footerContent = {
  name: 'KHAIRUL HUDA',
  roles: 'WEB / ANDROID / SAAS DEVELOPER',
  built: 'Built with React, Three.js and Framer Motion.',
  repo: GITHUB,
}
