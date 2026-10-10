import { z } from 'zod'
import { transporter } from '../lib/mailer.js'
import { renderTemplate } from '../lib/renderTemplate.js'
import { appendEmailRow } from '../lib/csvAppend.js'
import { config } from '../config.js'

export const marketingNotifySchema = z.object({
  email: z.string().trim().email().max(320),
})

export type MarketingNotifyData = z.infer<typeof marketingNotifySchema>

async function sendNotifyEmails(email: string): Promise<void> {
  const confirmationHtml = renderTemplate('marketing-waitlist.html', {
    name: 'there',
  })

  await Promise.all([
    transporter.sendMail({
      from: config.mailFrom,
      to: email,
      subject: "You're on the list — Flintworks Marketing",
      html: confirmationHtml,
    }),
    transporter.sendMail({
      from: config.mailFromNotification,
      to: config.mailToTeam,
      replyTo: email,
      subject: `Marketing notify: ${email}`,
      text: `New marketing waitlist signup\n\nEmail: ${email}\n`,
    }),
  ])
}

/**
 * Persist the email to CSV, then notify team + subscriber.
 * Duplicate emails are treated as success (already on the list).
 */
export async function recordMarketingNotify(data: MarketingNotifyData): Promise<void> {
  const email = data.email.trim().toLowerCase()
  const timestamp = new Date().toISOString()
  const created = await appendEmailRow(config.marketingNotifyCsvPath, email, timestamp)

  if (!created) return

  try {
    await sendNotifyEmails(email)
  } catch (error) {
    // CSV is the source of truth — signup is kept even if mail fails.
    console.error('Marketing notify email error (signup was saved):', error)
  }
}
