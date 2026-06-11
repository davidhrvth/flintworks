import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback
}

function parseOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return []
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  emailTemplatesDir: resolve(
    optional('EMAIL_TEMPLATES_DIR', resolve(__dirname, '../../email-templates')),
  ),
  smtp: {
    host: required('SMTP_HOST', process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: required('SMTP_USER', process.env.SMTP_USER),
    pass: required('SMTP_PASSWORD', process.env.SMTP_PASSWORD),
  },
  mailFrom: optional('MAIL_FROM', '"Flintworks" <hello@flintworks.io>'),
  mailFromNotification: optional(
    'MAIL_FROM_NOTIFICATION',
    '"Flintworks" <noreply@flintworks.io>',
  ),
  mailToTeam: required('MAIL_TO_TEAM', process.env.MAIL_TO_TEAM),
}
