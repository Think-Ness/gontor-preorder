import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico'
  let title = 'Pre-Order Reunion Kit 100 Tahun Gontor'
  let description = 'Official Merchandise Pre-Order System — Peringatan 100 Tahun Gontor. Reuni Akbar Alumni Gontor 19–20 September 2026.'

  try {
    const supabase = await createClient()
    const { data: settings } = await supabase.from('event_settings').select('*').single()
    if (settings?.favicon_url) {
      faviconUrl = settings.favicon_url
    }
    if (settings?.event_name) {
      title = settings.event_name
    }
    if (settings?.event_description) {
      description = settings.event_description
    }
  } catch (err) {
    // Fallback default
  }

  return {
    title,
    description,
    keywords: ['Gontor', 'Reunion Kit', 'Pre-Order', 'Merchandise', '100 Tahun Gontor'],
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
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
