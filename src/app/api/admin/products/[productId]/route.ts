import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/schemas'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET product detail with variants
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  const supabase = await createAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*), size_chart:size_charts(*)')
    .eq('id', productId)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ data: product }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    }
  })
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
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const body = await req.json()
    const { variants, ...productData } = body

    if (!productData.slug || productData.slug.trim() === '') {
      productData.slug = slugify(productData.name || 'product')
    } else {
      productData.slug = slugify(productData.slug)
    }

    const parsed = productSchema.safeParse(productData)
    if (!parsed.success) {
      console.warn('[PUT /api/admin/products/[productId]] Validation failed:', parsed.error.issues)
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

    if (updateErr) {
      console.warn('[PUT /api/admin/products] Update warning/error:', updateErr.message)
      const fallbackData = { ...data }
      delete fallbackData.weight_gram
      delete fallbackData.material_description
      delete fallbackData.size_chart_drive_file_id
      delete fallbackData.size_chart_image_url
      delete fallbackData.size_chart_filename

      const retry = await supabase
        .from('products')
        .update(fallbackData)
        .eq('id', productId)
      updateErr = retry.error
    }

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // Update or replace variants
    if (data.has_variants && Array.isArray(variants)) {
      const validVariants = variants.filter((v: any) => v.name && String(v.name).trim() !== '')
      
      const existingVariants = validVariants.filter((v: any) => v.id && String(v.id).trim() !== '')
      const newVariants = validVariants.filter((v: any) => !v.id || String(v.id).trim() === '')
      const existingIds = existingVariants.map((v: any) => v.id)

      // Fetch current variants in DB to calculate diff
      const { data: currentDbVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId)

      const currentIds = (currentDbVariants || []).map(v => v.id)
      const idsToDelete = currentIds.filter(id => !existingIds.includes(id))

      // 1. Delete removed variants
      if (idsToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('product_variants')
          .delete()
          .in('id', idsToDelete)
        if (delErr) console.error('[PUT /api/admin/products/[productId]] Variant delete error:', delErr)
      }

      // 2. Update existing variants
      for (const v of existingVariants) {
        const row: any = {
          sku: v.sku || `${data.product_code}-${v.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: v.name.trim(),
          price: Number(v.price ?? data.price),
          stock: v.stock !== undefined && v.stock !== '' && v.stock !== null ? Number(v.stock) : null,
          is_active: v.is_active ?? true,
        }
        const { error: updErr } = await supabase
          .from('product_variants')
          .update(row)
          .eq('id', v.id)
        if (updErr) console.error('[PUT /api/admin/products/[productId]] Variant update error:', updErr)
      }

      // 3. Insert new variants
      if (newVariants.length > 0) {
        const newRows = newVariants.map((v: any, index: number) => ({
          product_id: productId,
          sku: v.sku || `${data.product_code}-${v.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: v.name.trim(),
          price: Number(v.price ?? data.price),
          stock: v.stock !== undefined && v.stock !== '' && v.stock !== null ? Number(v.stock) : null,
          is_active: v.is_active ?? true,
          display_order: existingVariants.length + index,
        }))

        const { error: insErr } = await supabase
          .from('product_variants')
          .insert(newRows)
        if (insErr) console.error('[PUT /api/admin/products/[productId]] Variant insert error:', insErr)
      }
    } else if (!data.has_variants) {
      // Clear variants if no longer has variants
      await supabase.from('product_variants').delete().eq('product_id', productId)
    }

    // Purge Vercel App Router caches across admin & public pages
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath('/order')
    revalidatePath('/')

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
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()

    // 1. Unlink order_items reference so past customer order receipts remain intact (snapshot) without FK violation
    await supabase.from('order_items').update({ product_id: null, variant_id: null }).eq('product_id', productId)

    // 2. Remove package_items links
    await supabase.from('package_items').delete().eq('product_id', productId)

    // 3. Delete product
    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Purge Vercel App Router caches across admin & public pages
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath('/order')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/products/[productId]]', err)
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
