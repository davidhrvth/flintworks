const SERVICE_LABELS: Record<string, string> = {
  'web-app': 'Web App & Platform',
  'business-website': 'Business Website',
  'mobile-app': 'Mobile App',
  startup: 'Startup Development',
  other: 'Other / Not Sure',
}

const BUDGET_LABELS: Record<string, string> = {
  'under-5k': 'Under €5,000',
  '5k-15k': '€5,000 – €15,000',
  '15k-50k': '€15,000 – €50,000',
  'over-50k': 'Over €50,000',
  unknown: 'Not sure yet',
}

export function formatService(value: string): string {
  return SERVICE_LABELS[value] ?? value
}

export function formatBudget(value: string): string {
  return BUDGET_LABELS[value] ?? value
}

export function formatCompany(value: string | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : 'Not provided'
}
