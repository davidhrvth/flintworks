// TODO: point this at your real API endpoint
const CONTACT_API_URL = import.meta.env.VITE_CONTACT_API_URL || '/api/contact'

export interface ContactFormData {
  name: string
  email: string
  company?: string
  service: string
  budget: string
  message: string
}

export interface ContactResponse {
  success: boolean
  message: string
}

export async function submitContactForm(data: ContactFormData): Promise<ContactResponse> {
  // TODO: wire up your email provider here (Resend, SendGrid, Postmark, etc.)
  const response = await fetch(CONTACT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Contact form submission failed: ${response.statusText}`)
  }

  return response.json()
}
