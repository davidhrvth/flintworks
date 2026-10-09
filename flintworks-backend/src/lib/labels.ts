const SERVICE_LABELS: Record<string, string> = {
  'business-website': 'Business Website',
  'web-app': 'Web App & Platform',
  'mobile-app': 'Mobile App',
  startup: 'Startup Development',
  discovery: 'Discovery Sprint',
  other: 'Something Else / Not Sure',
}

export function formatService(value: string): string {
  return SERVICE_LABELS[value] ?? value
}

export function formatCompany(value: string | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : 'Not provided'
}
