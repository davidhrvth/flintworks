export type ProjectType = 'web-app' | 'mobile' | 'website' | 'startup'

export interface Project {
  id: string
  type: ProjectType
  techStack: string[]
  image?: string
  caseStudyUrl?: string
}

export const projects: Project[] = [
  { id: 'alpha', type: 'web-app', techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Vercel'] },
  { id: 'beta', type: 'website', techStack: ['Next.js', 'Tailwind CSS', 'Sanity CMS', 'Vercel'] },
  { id: 'gamma', type: 'mobile', techStack: ['React Native', 'Supabase', 'Expo', 'TypeScript'] },
]
