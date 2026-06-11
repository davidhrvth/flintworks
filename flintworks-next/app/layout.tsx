import type { Metadata } from 'next'
import { Syne, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
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
  metadataBase: new URL('https://flintworks.io'),
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
      en: 'https://flintworks.io',
      hu: 'https://flintworks.io',
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
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
