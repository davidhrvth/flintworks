import { Router } from 'express'
import { contactFormSchema, sendContactEmails } from '../services/contactMailer.js'

export const contactRouter = Router()

contactRouter.post('/contact', async (req, res) => {
  const parsed = contactFormSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid form data. Please check all required fields.',
    })
    return
  }

  try {
    await sendContactEmails(parsed.data)
    res.json({ success: true, message: 'Message received!' })
  } catch (error) {
    console.error('Contact form email error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to send your message right now. Please try again later.',
    })
  }
})
