const MARKETING_NOTIFY_API_URL =
  process.env.NEXT_PUBLIC_MARKETING_NOTIFY_API_URL || '/api/marketing-notify'

export interface MarketingNotifyResponse {
  success: boolean
  message: string
}

/** `status` is the HTTP status, or 0 when the request never got a response. */
export class MarketingNotifySubmitError extends Error {
  constructor(public readonly status: number) {
    super(`Marketing notify submission failed (${status || 'network error'})`)
    this.name = 'MarketingNotifySubmitError'
  }
}

export async function submitMarketingNotify(email: string): Promise<MarketingNotifyResponse> {
  let response: Response

  try {
    response = await fetch(MARKETING_NOTIFY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  } catch {
    throw new MarketingNotifySubmitError(0)
  }

  if (!response.ok) {
    throw new MarketingNotifySubmitError(response.status)
  }

  return response.json()
}
