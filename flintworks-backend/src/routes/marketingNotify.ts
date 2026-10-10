import { Router } from 'express'
import { marketingNotifySchema, recordMarketingNotify } from '../services/marketingNotify.js'

export const marketingNotifyRouter = Router()

marketingNotifyRouter.post('/marketing-notify', async (req, res) => {
  const parsed = marketingNotifySchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    })
    return
  }

  try {
    await recordMarketingNotify(parsed.data)
    res.json({ success: true, message: "You're on the list!" })
  } catch (error) {
    console.error('Marketing notify error:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to save your email right now. Please try again later.',
    })
  }
})
