import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AnimatedSection } from '../ui/AnimatedSection'
import { EmberBadge } from '../ui/EmberBadge'
import { projects } from '../../data/projects'
import type { ProjectType } from '../../data/projects'
import type { ComponentProps } from 'react'

type BadgeVariant = ComponentProps<typeof EmberBadge>['variant']

const badgeVariantMap: Record<ProjectType, BadgeVariant> = {
  'web-app': 'in-dev',
  'mobile': 'ember',
  'website': 'surface',
  'startup': 'muted',
}

export function PortfolioGrid({ limit }: { limit?: number }) {
  const { t } = useTranslation()
  const displayProjects = limit ? projects.slice(0, limit) : projects

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {displayProjects.map((project, i) => (
        <AnimatedSection key={project.id} delay={i * 0.1}>
          <motion.article
            className="glass rounded-xl border border-white/5 p-8 flex flex-col h-full hover:border-ember/20 transition-all duration-300 group"
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* TODO: replace with real screenshot */}
            <div className="w-full h-40 rounded-lg bg-surface border border-border mb-6 flex items-center justify-center overflow-hidden">
              <span className="font-mono text-xs text-text-muted">// TODO: replace with real screenshot</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <EmberBadge variant={badgeVariantMap[project.type] ?? 'surface'}>
                {t(`work.projects.${project.id}.category`)}
              </EmberBadge>
            </div>

            <h3 className="font-display font-bold text-xl text-text-heading mb-2 group-hover:text-ember transition-colors">
              {t(`work.projects.${project.id}.name`)}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed flex-1 mb-4">
              {t(`work.projects.${project.id}.description`)}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-xs font-mono text-text-muted bg-surface border border-border"
                >
                  {tech}
                </span>
              ))}
            </div>

            <Link
              to={`/work#${project.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember hover:text-flame transition-colors group/link"
            >
              {t('work.viewCaseStudy')}
              <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </motion.article>
        </AnimatedSection>
      ))}
    </div>
  )
}
