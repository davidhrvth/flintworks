import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getCaseStudyBySlug,
  getCaseStudiesByEntryPoint,
} from '@/data/case-studies'
import en from '@/i18n/locales/en/translation.json'
import CaseStudyPageContent from './client'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getCaseStudiesByEntryPoint('studio').map((study) => ({
    slug: study.slug,
  }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)

  if (!study || study.entryPoint !== 'studio') {
    return { title: 'Case Study — Flintworks Studio' }
  }

  const project =
    en.caseStudy.projects[study.id as keyof typeof en.caseStudy.projects]
  const name = project?.name ?? study.slug
  const description =
    project?.metaDescription ??
    'Flintworks Studio case study.'

  return {
    title: `${name} — Case Study`,
    description,
    openGraph: {
      title: `${name} — Case Study | Flintworks Studio`,
      description,
      url: `https://flintworks.hu/studio/${slug}`,
      type: 'article',
    },
  }
}

export default async function StudioCaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const study = getCaseStudyBySlug(slug)

  if (!study || study.entryPoint !== 'studio') {
    notFound()
  }

  return <CaseStudyPageContent study={study} />
}
