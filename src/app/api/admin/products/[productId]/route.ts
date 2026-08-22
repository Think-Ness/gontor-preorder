import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/schemas'

// GET product detail with variants
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  const supabase = await createAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', productId)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ data: product })
}

// PUT update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const body = await req.json()
    const { variants, ...productData } = body

    const parsed = productSchema.safeParse(productData)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Data tidak valid' }, { status: 400 })
    }

    const data: any = { ...parsed.data }
    if (data.weight_gram === undefined || data.weight_gram === null) {
      delete data.weight_gram
    }

    // Update product with fallback if column not yet added in Supabase schema
    let { error: updateErr } = await supabase
      .from('products')
      .update(data)
      .eq('id', productId)

    if (updateErr && updateErr.message?.includes('weight_gram')) {
      delete data.weight_gram
      const retry = await supabase
        .from('products')
        .update(data)
        .eq('id', productId)
      updateErr = retry.error
    }

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // Update or replace variants
    if (data.has_variants && Array.isArray(variants)) {
      const variantRows = variants.map((v: any, index: number) => {
        const row: any = {
          product_id: productId,
          sku: v.sku || `${data.product_code}-${v.name.toLowerCase().replace(/\\s+/g, '-')}`,
          name: v.name,
          price: Number(v.price ?? data.price),
          stock: v.stock !== undefined && v.stock !== '' && v.stock !== null ? Number(v.stock) : null,
          is_active: v.is_active ?? true,
          display_order: index,
        }
        if (v.id) row.id = v.id
        return row
      })

      const existingIds = variantRows.filter(v => v.id).map(v => v.id)

      // Delete removed variants
      if (existingIds.length > 0) {
        await supabase.from('product_variants')
          .delete()
          .eq('product_id', productId)
          .not('id', 'in', `(${existingIds.join(',')})`)
      } else {
        await supabase.from('product_variants').delete().eq('product_id', productId)
      }

      if (variantRows.length > 0) {
        await supabase.from('product_variants').upsert(variantRows)
      }
    } else if (!data.has_variants) {
      // Clear variants if no longer has variants
      await supabase.from('product_variants').delete().eq('product_id', productId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/admin/products/[productId]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 })
  }
}

// DELETE product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()

    // 1. Unlink order_items reference so past customer order receipts remain intact (snapshot) without FK violation
    await supabase.from('order_items').update({ product_id: null, variant_id: null }).eq('product_id', productId)

    // 2. Remove package_items links
    await supabase.from('package_items').delete().eq('product_id', productId)

    // 3. Delete product
    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/products/[productId]]', err)
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
