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
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'studio-mobile',
    slug: 'vibe',
    entryPoint: 'studio',
    status: 'pre-launch',
    launchMonthKey: 'august2026',
    heroImage: '/case-studies/vibe/hero-placeholder.svg',
    screenshots: [
      '/case-studies/vibe/screenshot-1-placeholder.svg',
      '/case-studies/vibe/screenshot-2-placeholder.svg',
    ],
    techGroups: [
      {
        id: 'frontend',
        items: ['React Native', 'Expo 56', 'Expo Router', 'TypeScript', 'Mapbox', 'Reanimated', 'PostHog'],
      },
      {
        id: 'backend',
        items: ['Node.js', 'Express 5', 'TypeScript', 'PostgreSQL', 'Zod', 'JWT / JWKS OAuth'],
      },
      {
        id: 'infra',
        items: ['Redis', 'BullMQ worker', 'systemd on VPS', 'GitHub Actions', 'EAS Build'],
      },
      {
        id: 'integrations',
        items: ['Mapbox', 'Gemini (catalog AI)', 'Apple/Google/Facebook auth', 'Expo Push', 'PostHog'],
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
