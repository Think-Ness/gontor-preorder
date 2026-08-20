import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { productSchema } from '@/lib/validations/schemas'

export async function POST(req: NextRequest) {
  try {
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

    const data = parsed.data

    // Insert main product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .insert(data)
      .select('id')
      .single()

    if (prodErr) {
      console.error('[POST /api/admin/products]', prodErr)
      return NextResponse.json({ error: prodErr.message }, { status: 500 })
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

    return NextResponse.json({ success: true, id: product.id })
  } catch (err) {
    console.error('[POST /api/admin/products]', err)
    return NextResponse.json({ error: 'Gagal menambah produk' }, { status: 500 })
  }
}
