'use client'

import { CaseStudyView } from '@/components/case-study/CaseStudyView'
import type { CaseStudy } from '@/data/case-studies'

export default function CaseStudyPageContent({ study }: { study: CaseStudy }) {
  return <CaseStudyView study={study} />
}
