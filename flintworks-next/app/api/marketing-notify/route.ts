import type { MarketingNotifyResponse } from '@/api/marketingNotify'

const BACKEND_URL = process.env.CONTACT_BACKEND_URL ?? 'http://127.0.0.1:3001'

export async function POST(request: Request): Promise<Response> {
  let backendResponse: Response

  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/marketing-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
    })
  } catch (error) {
    console.error('Marketing notify backend unavailable:', error)
    return Response.json(
      {
        success: false,
        message: 'Unable to save your email right now. Please try again later.',
      } satisfies MarketingNotifyResponse,
      { status: 503 },
    )
  }

  const data = (await backendResponse.json()) as MarketingNotifyResponse
  return Response.json(data, { status: backendResponse.status })
}
