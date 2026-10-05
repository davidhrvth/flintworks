export type CaseStudyStatus = 'pre-launch' | 'launched'
export type CaseStudyEntryPoint = 'studio' | 'work'

export interface CaseStudyTechGroup {
  id: string
  items: string[]
}

export interface CaseStudyMetric {
  labelKey: string
  value: string
}

export interface CaseStudy {
  id: string
  slug: string
  entryPoint: CaseStudyEntryPoint
  status: CaseStudyStatus
  /** Display month key for status badge interpolation, e.g. "August 2026" via i18n */
  launchMonthKey?: string
  techGroups: CaseStudyTechGroup[]
  screenshots?: string[]
  heroImage?: string
  appStoreUrl?: string
  playStoreUrl?: string
  demoVideoUrl?: string
  metrics?: CaseStudyMetric[]
  /** Optional quote i18n presence flag — quote copy lives in i18n when true */
  hasQuote?: boolean
  /** Portrait phone captures render in a denser grid than desktop captures */
  screenshotLayout?: 'phone' | 'desktop'
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'studio-mobile',
    slug: 'vibe',
    entryPoint: 'studio',
    status: 'launched',
    heroImage: '/case-studies/vibe/hero.webp',
    appStoreUrl: 'https://apps.apple.com/hu/app/vibe-passport-to-nightlife/id6777436186',
    screenshotLayout: 'phone',
    screenshots: [
      '/case-studies/vibe/app-map.webp',
      '/case-studies/vibe/app-venue-sheet.webp',
      '/case-studies/vibe/app-event-detail.webp',
      '/case-studies/vibe/app-timetable.webp',
    ],
    metrics: [
      { labelKey: 'caseStudy.projects.studio-mobile.metrics.events', value: '339' },
      { labelKey: 'caseStudy.projects.studio-mobile.metrics.ratings', value: '132' },
      { labelKey: 'caseStudy.projects.studio-mobile.metrics.ratedAttendances', value: '25/33' },
      { labelKey: 'caseStudy.projects.studio-mobile.metrics.buildMonths', value: '3' },
    ],
    techGroups: [
      {
        id: 'frontend',
        items: ['React Native', 'Expo SDK 56', 'Expo Router', 'TypeScript', 'Mapbox', 'Reanimated', 'PostHog'],
      },
      {
        id: 'backend',
        items: ['Node.js', 'Express 5', 'TypeScript', 'PostgreSQL', 'Zod', 'JWT / OAuth', 'Vitest'],
      },
      {
        id: 'infra',
        items: ['Redis', 'BullMQ worker', 'Playwright scraper worker', 'systemd on VPS', 'GitHub Actions'],
      },
      {
        id: 'integrations',
        items: [
          'Mapbox',
          'Gemini (flyers, lineups, genres)',
          'Oneticket · Cooltix · Resident Advisor',
          'Apple/Google/Facebook sign-in',
          'Expo Push',
          'PostHog',
        ],
      },
    ],
  },
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug)
}

export function getCaseStudyById(id: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.id === id)
}

export function getCaseStudiesByEntryPoint(entryPoint: CaseStudyEntryPoint): CaseStudy[] {
  return caseStudies.filter((study) => study.entryPoint === entryPoint)
}
