import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPreorderStatus } from '@/lib/utils'
import { redirect } from 'next/navigation'
import OrderFlow from '@/components/public/OrderFlow'

export const metadata: Metadata = {
  title: 'Pesan Reunion Kit — 100 Tahun Gontor',
  description: 'Form pemesanan official merchandise Reunion Kit 100 Tahun Gontor',
}

export const revalidate = 60

export default async function OrderPage() {
  const supabase = await createClient()

  const [{ data: settings }, { data: productsRaw }, { data: packages }, { data: paymentMethods }, { data: sizeChartsRaw }] =
    await Promise.all([
      supabase.from('event_settings').select('*').single(),
      supabase.from('products').select('*, variants:product_variants(*), size_chart:size_charts(*)').eq('is_active', true).order('display_order'),
      supabase.from('packages').select('*, items:package_items(*, product:products(*), variant:product_variants(*))').eq('is_active', true).order('display_order'),
      supabase.from('payment_methods').select('*').eq('is_active', true).order('display_order'),
      supabase.from('size_charts').select('*'),
    ])

  const sizeChartMap = new Map((sizeChartsRaw || []).map((sc: any) => [sc.id, sc]))
  const products = (productsRaw || []).map((p: any) => ({
    ...p,
    size_chart: p.size_chart || (p.size_chart_id ? sizeChartMap.get(p.size_chart_id) : null) || null,
  }))

  const status = getPreorderStatus(settings)

  return (
    <OrderFlow
      settings={settings}
      preorderStatus={status}
      products={products ?? []}
      packages={packages ?? []}
      paymentMethods={paymentMethods ?? []}
    />
  )
}
