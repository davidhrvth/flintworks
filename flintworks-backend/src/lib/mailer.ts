import nodemailer from 'nodemailer'
import { config } from '../config.js'

export const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
})

export async function verifyMailer(): Promise<void> {
  await transporter.verify()
}
