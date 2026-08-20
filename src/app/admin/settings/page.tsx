import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import EventSettingsForm from '@/components/admin/EventSettingsForm'

export const metadata: Metadata = { title: 'Pengaturan Event' }

export default async function SettingsPage() {
  const supabase = await createAdminClient()
  const { data: settings } = await supabase.from('event_settings').select('*').single()
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Pengaturan Event</h1>
        <p className="text-gray-500 text-sm">Kelola periode pre-order dan informasi event</p>
      </div>
      <EventSettingsForm initialData={settings} />
    </div>
  )
}
