// Everything here comes from Khairul122's public GitHub data (203 repos, 0 forks,
// repo language field, creation dates, and repo names). Nothing is self-rated.
export const aboutContent = {
  eyebrow: 'ABOUT ME',
  name: ['KHAIRUL', 'HUDA'],
  tagline: 'WEB, ANDROID, SAAS',
  intro: [
    "I'm Khairul Huda, a developer who has been shipping code on GitHub since 2021: 203 public repositories, none of them forks.",
    'The repositories cover systems such as cooperatives, libraries, payroll, village administration and public services, plus mobile apps and backend services. On the side I run machine learning and computer vision experiments in Python.',
  ],
  cta: { text: 'SEE THE REPOSITORIES', href: 'https://github.com/Khairul122?tab=repositories' },
  // The button only renders when /cv.pdf really exists (drop the file in public/cv.pdf).
  cv: { text: 'DOWNLOAD CV', href: '/cv.pdf', filename: 'Khairul-Huda-CV.pdf' },
  card: {
    photo: '/images/profile.webp',
    label: 'ID CARD',
    since: 'GITHUB SINCE 2021',
    nameLines: ['KHAIRUL', 'HUDA'],
    role: 'WEB / ANDROID / SAAS',
    handle: 'GITHUB.COM/KHAIRUL122',
    backTitle: 'PORTFOLIO',
    backRoles: ['WEB DEVELOPER', 'ANDROID DEVELOPER', 'SAAS DEVELOPER'],
    hint: 'DRAG THE CARD, TAP TO FLIP',
  },
  roles: [
    {
      title: 'WEB DEVELOPER',
      accent: '#ff6a5f',
      group: 'web',
      desc: 'PHP and Laravel first, with JavaScript, HTML and CSS on the front.',
      examples: 'Cooperative, library, payroll, village and academic information systems.',
    },
    {
      title: 'ANDROID DEVELOPER',
      accent: '#4ade80',
      group: 'mobile',
      desc: 'Mostly Flutter in Dart, with some native Kotlin.',
      examples: 'Boarding-house rental apps and marketplace apps.',
    },
    {
      title: 'SAAS DEVELOPER',
      accent: '#7aa7ff',
      group: 'backend',
      desc: 'Backend services, mostly PHP, with TypeScript and Python.',
      examples: 'Public service, medical record, parking and supply chain backends.',
    },
    {
      title: 'ALSO EXPLORING',
      accent: '#d4d7de',
      group: 'ai',
      desc: 'Machine learning and computer vision in Python.',
      examples: 'KNN, Naive Bayes, LSTM, CNN and YOLO experiments.',
    },
  ],
}
