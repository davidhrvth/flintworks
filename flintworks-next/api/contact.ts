const CONTACT_API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL || '/api/contact'

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
