import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pre-Order Reunion Kit 100 Tahun Gontor',
  description: 'Official Merchandise Pre-Order System — Peringatan 100 Tahun Gontor. Reuni Akbar Alumni Gontor 19–20 September 2026.',
  keywords: ['Gontor', 'Reunion Kit', 'Pre-Order', 'Merchandise', '100 Tahun Gontor'],
  openGraph: {
    title: 'Pre-Order Reunion Kit 100 Tahun Gontor',
    description: 'Official Merchandise Peringatan 100 Tahun Gontor',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
