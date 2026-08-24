import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/schemas'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    // Insert main product with fallback if column not yet added to Supabase schema
    let { data: product, error: prodErr } = await supabase
      .from('products')
      .insert(data)
      .select('id')
      .single()

    if (prodErr) {
      console.warn('[POST /api/admin/products] Insert warning/error:', prodErr.message)
      const fallbackData = { ...data }
      delete fallbackData.weight_gram
      delete fallbackData.material_description
      delete fallbackData.size_chart_drive_file_id
      delete fallbackData.size_chart_image_url
      delete fallbackData.size_chart_filename

      const retry = await supabase
        .from('products')
        .insert(fallbackData)
        .select('id')
        .single()
      product = retry.data
      prodErr = retry.error
    }

    if (prodErr || !product) {
      console.error('[POST /api/admin/products]', prodErr)
      return NextResponse.json({ error: prodErr?.message || 'Gagal membuat produk' }, { status: 500 })
    }

    // Insert variants if any
    if (data.has_variants && Array.isArray(variants) && variants.length > 0) {
      const variantRows = variants.map((v: any, index: number) => ({
        product_id: product.id,
        sku: v.sku || `${data.product_code}-${v.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: v.name,
        price: Number(v.price ?? data.price),
        stock: v.stock !== undefined && v.stock !== '' ? Number(v.stock) : null,
        is_active: v.is_active ?? true,
        display_order: index,
      }))

      const { error: varErr } = await supabase.from('product_variants').insert(variantRows)
      if (varErr) console.error('[POST /api/admin/products] Variants error:', varErr)
    }

    // Purge App Router caches
    revalidatePath('/admin/products')
    revalidatePath('/order')
    revalidatePath('/')

    return NextResponse.json({ success: true, id: product.id })
  } catch (err) {
    console.error('[POST /api/admin/products]', err)
    return NextResponse.json({ error: 'Gagal menambah produk' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const body = await req.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Pilih minimal satu produk untuk dihapus' }, { status: 400 })
    }

    // 1. Unlink order_items reference so past customer order receipts remain intact (snapshot) without FK violation
    await supabase.from('order_items').update({ product_id: null, variant_id: null }).in('product_id', ids)

    // 2. Remove package_items links
    await supabase.from('package_items').delete().in('product_id', ids)

    // 3. Delete products (product_variants will CASCADE)
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('[DELETE /api/admin/products]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Purge App Router caches
    revalidatePath('/admin/products')
    revalidatePath('/order')
    revalidatePath('/')

    return NextResponse.json({ success: true, deletedCount: ids.length })
  } catch (err) {
    console.error('[DELETE /api/admin/products]', err)
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
