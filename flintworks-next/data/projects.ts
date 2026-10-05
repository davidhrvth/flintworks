export type ProjectType = 'web-app' | 'mobile' | 'website' | 'startup'

export interface Project {
  id: string
  type: ProjectType
  techStack: string[]
  image?: string
  caseStudyUrl?: string
  liveUrl?: string
  comingSoon?: boolean
}

export const projects: Project[] = [
  {
    id: 'vibe',
    type: 'mobile',
    techStack: ['React Native', 'Expo', 'TypeScript', 'Mapbox', 'PostgreSQL', 'Gemini'],
    image: '/case-studies/vibe/hero.webp',
    caseStudyUrl: '/studio/vibe',
  },
  {
    id: 'skomai-logistico',
    type: 'website',
    techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'PHP'],
    image: '/work/skomai-logistico/cover.webp',
    liveUrl: 'https://skomai-logistico.es',
  },
  {
    id: 'horgasz-szallas',
    type: 'web-app',
    techStack: ['Next.js', 'React', 'TypeScript', 'Express', 'MongoDB', 'Socket.IO'],
    image: '/work/horgasz-szallas/cover.webp',
    comingSoon: true,
  },
]
