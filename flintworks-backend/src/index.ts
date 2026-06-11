import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import { verifyMailer } from './lib/mailer.js'
import { contactRouter } from './routes/contact.js'

const app = express()

app.set('trust proxy', 1)

app.use(express.json({ limit: '32kb' }))

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.length === 0 || config.corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
  }),
)

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
  }),
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', contactRouter)

async function start(): Promise<void> {
  try {
    await verifyMailer()
    console.log('SMTP connection verified')
  } catch (error) {
    console.warn('SMTP verification failed — emails may not send until credentials are configured')
    console.warn(error)
  }

  app.listen(config.port, () => {
    console.log(`Flintworks backend listening on port ${config.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
