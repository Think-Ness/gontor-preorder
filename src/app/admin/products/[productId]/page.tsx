import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditProductClient from './EditProductClient'

export const metadata: Metadata = { title: 'Edit Produk' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const supabase = await createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', productId)
    .single()

  if (!product) notFound()

  return <EditProductClient initialProduct={product} />
}
