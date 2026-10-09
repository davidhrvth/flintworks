import type { Metadata } from 'next'
import { Syne, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { DocumentLang } from '@/components/layout/DocumentLang'
import { I18nInit } from '@/components/I18nInit'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://flintworks.hu'),
  manifest: '/site.webmanifest',
  title: {
    default: 'Flintworks — Software Agency Budapest',
    template: '%s | Flintworks',
  },
  description:
    'Budapest-based software agency building web apps, mobile apps, and digital platforms for businesses that mean business.',
  openGraph: {
    siteName: 'Flintworks',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    languages: {
      en: 'https://flintworks.hu',
      hu: 'https://flintworks.hu',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <I18nInit />
        <DocumentLang />
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
