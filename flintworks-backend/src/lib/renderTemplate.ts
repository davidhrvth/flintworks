import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { config } from '../config.js'
import { escapeHtml } from './escapeHtml.js'

export function renderTemplate(
  templateName: string,
  variables: Record<string, string>,
): string {
  const templatePath = join(config.emailTemplatesDir, templateName)
  let html = readFileSync(templatePath, 'utf8')

  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, escapeHtml(value))
  }

  return html
}
