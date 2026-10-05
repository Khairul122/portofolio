// All numbers are real, computed from Khairul122's 203 public GitHub repos
// (language field, creation dates, repo names). Nothing is self-rated.
export const recap = {
  name: ['KHAIRUL', 'HUDA'],
  handle: 'github.com/Khairul122',
  repos: 203,
  forks: 0,
  languages: 15,
  since: 2021,
  years: [
    { label: '2021', value: 2 },
    { label: '2022', value: 7 },
    { label: '2023', value: 26 },
    { label: '2024', value: 79 },
    { label: '2025', value: 61 },
    { label: '2026', value: 28 },
  ],
  roles: [
    {
      title: ['WEB', 'DEVELOPER'],
      color: '#e8342a',
      value: 154,
      desc: 'PHP and Laravel first, with JavaScript, HTML and CSS on the front.',
      examples: 'Cooperative, library, payroll, village and academic information systems.',
      tags: ['PHP', 'CSS', 'JAVASCRIPT', 'HTML'],
    },
    {
      title: ['ANDROID', 'DEVELOPER'],
      color: '#14803f',
      value: 14,
      desc: 'Mostly Flutter in Dart, with some native Kotlin.',
      examples: 'Boarding-house rental apps and marketplace apps.',
      tags: ['DART', 'KOTLIN', 'JAVA'],
    },
    {
      title: ['SAAS', 'DEVELOPER'],
      color: '#2563eb',
      value: 12,
      desc: 'Backend services, mostly PHP, with TypeScript and Python.',
      examples: 'Public service, medical record, parking and supply chain backends.',
      tags: ['PHP', 'TYPESCRIPT', 'PYTHON'],
    },
  ],
  // The 12 backend repos overlap the web ones (9 are PHP/TS), so the repo grid only
  // partitions by language group: 154 web + 14 mobile + 35 other = 203.
  other: 35,
  exploring: ['KNN', 'NAIVE BAYES', 'LSTM', 'CNN', 'YOLO'],
  links: [
    { label: 'LINKEDIN', text: 'KHAIRUL HUDA' },
    { label: 'INSTAGRAM', text: '@KHRL.ARLL1' },
    { label: 'GITHUB', text: 'KHAIRUL122' },
  ],
}

export const FPS = 30
// Scene lengths in frames: hello, github, three roles, years, outro.
export const SCENES = { hello: 110, github: 160, role: 70, years: 150, outro: 120 }
export const DURATION = SCENES.hello + SCENES.github + SCENES.role * 3 + SCENES.years + SCENES.outro
