import type { Metadata } from 'next'
import { JetBrains_Mono, Oxanium } from 'next/font/google'
import './globals.css'

const displayFont = Oxanium({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'NEXUS-7 AI Control Matrix',
  description: 'Cinematic AI HUD Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${monoFont.variable}`}>{children}</body>
    </html>
  )
}
