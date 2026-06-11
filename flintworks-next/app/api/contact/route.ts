import type { ContactResponse } from '@/api/contact'

const BACKEND_URL = process.env.CONTACT_BACKEND_URL ?? 'http://127.0.0.1:3001'

export async function POST(request: Request): Promise<Response> {
  let backendResponse: Response

  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
    })
  } catch (error) {
    console.error('Contact backend unavailable:', error)
    return Response.json(
      {
        success: false,
        message: 'Unable to send your message right now. Please try again later.',
      } satisfies ContactResponse,
      { status: 503 },
    )
  }

  const data = (await backendResponse.json()) as ContactResponse
  return Response.json(data, { status: backendResponse.status })
}
