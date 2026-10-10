const MARKETING_NOTIFY_API_URL =
  import.meta.env.VITE_MARKETING_NOTIFY_API_URL || '/api/marketing-notify'

export interface MarketingNotifyResponse {
  success: boolean
  message: string
}

export async function submitMarketingNotify(email: string): Promise<MarketingNotifyResponse> {
  const response = await fetch(MARKETING_NOTIFY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error(`Marketing notify submission failed: ${response.statusText}`)
  }

  return response.json()
}
