import { createClient } from '@/lib/supabase/server'
import { getPreorderStatus } from '@/lib/utils'
import { EventSettings } from '@/types'
import LandingPage from '@/components/public/LandingPage'

export const revalidate = 60 // Revalidate every 60 seconds

// Interfaces for stats data
export interface ProductStat {
  productId: string
  productName: string
  imageUrl: string | null
  totalQty: number
  alumniQty: number
  umumQty: number
  totalOrders: number
}

export interface MapPinData {
  lat: number
  lng: number
  isAlumni: boolean
  province: string | null
  city: string | null
  district: string | null
  fulfillmentMethod: string | null
}

async function getPageData() {
  const supabase = await createClient()

  const [
    { data: settings },
    { data: products },
    { data: packages },
    { data: paymentMethods },
    { data: orderItemsRaw },
    { data: provinceRaw },
  ] = await Promise.all([
    supabase
      .from('event_settings')
      .select('*')
      .single(),
    supabase
      .from('products')
      .select('*, variants:product_variants(*), size_chart:size_charts(*)')
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
    // Order items with order + product info for purchase stats
    supabase
      .from('order_items')
      .select(`
        item_name_snapshot,
        quantity,
        product_id,
        package_id,
        orders!inner (is_alumni, order_status, payment_status)
      `)
      .not('orders.order_status', 'eq', 'CANCELLED')
      .not('orders.order_status', 'eq', 'REJECTED')
      .not('orders.order_status', 'eq', 'DRAFT'),
    // Map pins data
    supabase
      .from('orders')
      .select('shipping_latitude, shipping_longitude, is_alumni, shipping_province, shipping_city, shipping_district, fulfillment_method')
      .neq('order_status', 'CANCELLED')
      .neq('order_status', 'REJECTED')
      .neq('order_status', 'DRAFT')
      .not('shipping_latitude', 'is', null)
      .not('shipping_longitude', 'is', null),
  ])

  // -- Build product stats --
  const statMap = new Map<string, ProductStat>()

  // Merge products + packages lookup
  const productLookup = new Map<string, { name: string; imageUrl: string | null }>()
  for (const p of products ?? []) {
    productLookup.set(p.id, { name: p.name, imageUrl: p.image_url })
  }
  for (const pkg of packages ?? []) {
    productLookup.set(pkg.id, { name: pkg.name, imageUrl: pkg.image_url })
  }

  for (const item of orderItemsRaw ?? []) {
    const order = (item as any).orders
    const isAlumni = order?.is_alumni ?? false
    const key = item.product_id ?? item.package_id ?? item.item_name_snapshot
    const name = item.item_name_snapshot
    const qty = item.quantity ?? 1

    if (!statMap.has(key)) {
      const lookup = productLookup.get(item.product_id ?? item.package_id ?? '') 
      statMap.set(key, {
        productId: key,
        productName: name,
        imageUrl: lookup?.imageUrl ?? null,
        totalQty: 0,
        alumniQty: 0,
        umumQty: 0,
        totalOrders: 0,
      })
    }

    const stat = statMap.get(key)!
    stat.totalQty += qty
    stat.totalOrders += 1
    if (isAlumni) stat.alumniQty += qty
    else stat.umumQty += qty
  }

  const productStats: ProductStat[] = Array.from(statMap.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 8) // top 8 products

  // -- Build map pins --
  const mapPins: MapPinData[] = (provinceRaw ?? []).map(row => ({
    lat: Number(row.shipping_latitude),
    lng: Number(row.shipping_longitude),
    isAlumni: row.is_alumni,
    province: row.shipping_province || null,
    city: row.shipping_city || null,
    district: row.shipping_district || null,
    fulfillmentMethod: row.fulfillment_method || null,
  }))

  return {
    settings: settings as EventSettings | null,
    products: products ?? [],
    packages: packages ?? [],
    primaryPayment: paymentMethods?.[0] ?? null,
    productStats,
    mapPins,
  }
}

export default async function HomePage() {
  const { settings, products, packages, primaryPayment, productStats, mapPins } = await getPageData()
  const preorderStatus = getPreorderStatus(settings)

  return (
    <LandingPage
      settings={settings}
      preorderStatus={preorderStatus}
      products={products}
      packages={packages}
      primaryPayment={primaryPayment}
      productStats={productStats}
      mapPins={mapPins}
    />
  )
}
