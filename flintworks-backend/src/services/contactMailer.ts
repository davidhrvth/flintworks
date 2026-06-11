import { z } from 'zod'
import { transporter } from '../lib/mailer.js'
import { renderTemplate } from '../lib/renderTemplate.js'
import { formatBudget, formatCompany, formatService } from '../lib/labels.js'
import { config } from '../config.js'

export const contactFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(200).optional(),
  service: z.string().trim().min(1).max(100),
  budget: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(5000),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export async function sendContactEmails(data: ContactFormData): Promise<void> {
  const serviceLabel = formatService(data.service)
  const budgetLabel = formatBudget(data.budget)
  const companyLabel = formatCompany(data.company)

  const confirmationHtml = renderTemplate('contact-confirmation.html', {
    name: data.name,
    service: serviceLabel,
    message: data.message,
  })

  const notificationHtml = renderTemplate('contact-notification.html', {
    name: data.name,
    email: data.email,
    company: companyLabel,
    service: serviceLabel,
    budget: budgetLabel,
    message: data.message,
  })

  await Promise.all([
    transporter.sendMail({
      from: config.mailFrom,
      to: data.email,
      subject: `We got your message, ${data.name}`,
      html: confirmationHtml,
    }),
    transporter.sendMail({
      from: config.mailFromNotification,
      to: config.mailToTeam,
      replyTo: data.email,
      subject: `New contact: ${data.name}`,
      html: notificationHtml,
    }),
  ])
}
