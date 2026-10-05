import type { Metadata } from 'next'
import DeliveryLab from './client'

export const metadata: Metadata = {
  title: 'Delivery Lab',
  robots: { index: false, follow: false },
}

export default function DeliveryLabPage() {
  return (
      <DeliveryLab />
  )
}
