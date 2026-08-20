import { createClient } from '@/lib/supabase/server'
import { getPreorderStatus } from '@/lib/utils'
import { EventSettings } from '@/types'
import LandingPage from '@/components/public/LandingPage'

export const revalidate = 60 // Revalidate every 60 seconds

async function getPageData() {
  const supabase = await createClient()

  const [{ data: settings }, { data: products }, { data: packages }, { data: paymentMethods }] =
    await Promise.all([
      supabase
        .from('event_settings')
        .select('*')
        .single(),
      supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('packages')
        .select('*, items:package_items(*, product:products(*), variant:product_variants(*))')
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(1),
    ])

  return {
    settings: settings as EventSettings | null,
    products: products ?? [],
    packages: packages ?? [],
    primaryPayment: paymentMethods?.[0] ?? null,
  }
}

export default async function HomePage() {
  const { settings, products, packages, primaryPayment } = await getPageData()
  const preorderStatus = getPreorderStatus(settings)

  return (
    <LandingPage
      settings={settings}
      preorderStatus={preorderStatus}
      products={products}
      packages={packages}
      primaryPayment={primaryPayment}
    />
  )
}
