import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import PaymentSettingsClient from '@/components/admin/PaymentSettingsClient'

export const metadata: Metadata = { title: 'Rekening Pembayaran' }
export const revalidate = 0

export default async function PaymentSettingsPage() {
  const supabase = await createAdminClient()
  const { data: methods } = await supabase
    .from('payment_methods')
    .select('*')
    .order('display_order')

  return <PaymentSettingsClient initialMethods={methods ?? []} />
}
