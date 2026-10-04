import { BROOKLYN_AVATAR_URL, BUSINESS_AVATAR_URL, PINK_SHIRT_AVATAR_URL } from './AvatarCanvas'

export const TABS = ['ABOUT', 'SKILLS', 'CONTACT']

export const contactLinks = [
  { label: 'LINKEDIN', text: 'LINKEDIN / KHAIRUL HUDA', href: 'https://www.linkedin.com/in/khairul-huda-675824193/' },
  { label: 'INSTAGRAM', text: 'INSTAGRAM / @KHRL.ARLL1', href: 'https://www.instagram.com/khrl.arll1/' },
  { label: 'GITHUB', text: 'GITHUB / KHAIRUL122', href: 'https://github.com/Khairul122' },
]

// All counts below are real, pulled from Khairul122's 203 public GitHub repos
// (language field + repo-name patterns), not invented scores.
// `accent` recolors the whole hero (it overrides --color-red) per role.
export const avatarProfiles = {
  [BUSINESS_AVATAR_URL]: {
    accent: '#e8342a',
    performance: {
      label: 'PERFORMANCE',
      badge: '154 WEB REPOS',
      bars: [
        { label: 'PHP', value: 59, max: 59 },
        { label: 'CSS', value: 35, max: 59 },
        { label: 'JAVASCRIPT', value: 25, max: 59 },
        { label: 'HTML', value: 23, max: 59 },
      ],
      edition: 'WEB DEV EDITION',
    },
    character: {
      label: 'CHARACTER',
      draft: 'LV. 5+',
      titleLines: ['WEB', 'DEVELOPER'],
      nickname: 'THE SHIPPER',
      bio: 'Turning PHP and JavaScript into 154 shipped web repositories.',
      stats: ['LARAVEL BACKEND SPECIALIST', 'GOVERNMENT & COMMERCE SYSTEMS', 'NO FORKS, ALL ORIGINAL BUILDS'],
      tags: ['LARAVEL', 'JAVASCRIPT', 'HTML/CSS'],
      about: ['KHAIRUL HUDA', 'ON GITHUB SINCE 2021', 'MOST USED LANGUAGE IS PHP'],
    },
  },
  [PINK_SHIRT_AVATAR_URL]: {
    accent: '#14803f',
    performance: {
      label: 'PERFORMANCE',
      badge: '14 MOBILE REPOS',
      bars: [
        { label: 'DART', value: 10, max: 10 },
        { label: 'KOTLIN', value: 3, max: 10 },
        { label: 'JAVA', value: 1, max: 10 },
      ],
      edition: 'ANDROID DEV EDITION',
    },
    character: {
      label: 'CHARACTER',
      draft: 'LV. 5+',
      titleLines: ['ANDROID', 'DEVELOPER'],
      nickname: 'THE APK SHIPPER',
      bio: 'Turning Dart and Kotlin into 14 mobile app builds.',
      stats: ['FLUTTER & KOTLIN BUILDER', 'RENTAL & MARKETPLACE APPS', 'NO FORKS, ALL ORIGINAL BUILDS'],
      tags: ['DART', 'KOTLIN', 'FLUTTER'],
      about: ['KHAIRUL HUDA', 'ON GITHUB SINCE 2021', 'MOBILE WORK IS MOSTLY FLUTTER'],
    },
  },
  [BROOKLYN_AVATAR_URL]: {
    accent: '#2563eb',
    performance: {
      label: 'PERFORMANCE',
      badge: '12 BACKEND REPOS',
      bars: [
        { label: 'PHP', value: 7, max: 7 },
        { label: 'TYPESCRIPT', value: 2, max: 7 },
        { label: 'PYTHON', value: 2, max: 7 },
      ],
      edition: 'SAAS DEV EDITION',
    },
    character: {
      label: 'CHARACTER',
      draft: 'LV. 5+',
      titleLines: ['SAAS', 'DEVELOPER'],
      nickname: 'THE API SHIPPER',
      bio: 'Turning PHP and TypeScript into 12 backend service repositories.',
      stats: ['LARAVEL API ARCHITECT', 'GOVERNMENT & HEALTHCARE SYSTEMS', 'NO FORKS, ALL ORIGINAL BUILDS'],
      tags: ['PHP', 'TYPESCRIPT', 'PYTHON'],
      about: ['KHAIRUL HUDA', 'ON GITHUB SINCE 2021', 'BACKEND REPOS ARE MOSTLY PHP'],
    },
  },
}
