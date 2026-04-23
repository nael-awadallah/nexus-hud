import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEXUS-7 AI Control Matrix',
  description: 'Cinematic AI HUD Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
