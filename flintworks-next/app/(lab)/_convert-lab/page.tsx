import type { Metadata } from 'next'
import ConvertLab from './client'

export const metadata: Metadata = {
  title: 'Convert Lab',
  robots: { index: false, follow: false },
}

export default function ConvertLabPage() {
  return (
      <ConvertLab />
  )
}
