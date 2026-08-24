import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import ProductsListClient from './ProductsListClient'

export const metadata: Metadata = { title: 'Produk' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductsPage() {
  const supabase = await createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(count), size_chart:size_charts(id, name)')
    .order('display_order')

  return <ProductsListClient initialProducts={products ?? []} />
}
