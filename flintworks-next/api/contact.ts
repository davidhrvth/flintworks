const CONTACT_API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL || '/api/contact'

export interface ContactFormData {
  name: string
  email: string
  company?: string
  service: string
  message: string
}

export interface ContactResponse {
  success: boolean
  message: string
}

/** `status` is the HTTP status, or 0 when the request never got a response. */
export class ContactSubmitError extends Error {
  constructor(public readonly status: number) {
    super(`Contact form submission failed (${status || 'network error'})`)
    this.name = 'ContactSubmitError'
  }
}

export async function submitContactForm(data: ContactFormData): Promise<ContactResponse> {
  let response: Response

  try {
    response = await fetch(CONTACT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    throw new ContactSubmitError(0)
  }

  if (!response.ok) {
    throw new ContactSubmitError(response.status)
  }

  return response.json()
}
