import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, items, ttlMinutes = 15 } = body

    if (!sessionId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Session ID dan items wajib diisi' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data: result, error } = await supabase.rpc('reserve_cart_stock', {
      p_session_id: sessionId,
      p_items: items.map((i: any) => ({
        productId: i.productId ?? null,
        variantId: i.variantId ?? null,
        packageId: i.packageId ?? null,
        itemType: i.itemType,
        quantity: i.quantity,
      })),
      p_ttl_minutes: ttlMinutes,
    })

    if (error) {
      console.error('[POST /api/cart/reserve] Supabase error:', error)
      return NextResponse.json({ error: error.message || 'Gagal mengunci stok' }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Stok tidak mencukupi' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      expires_at: result.expires_at,
    })
  } catch (err) {
    console.error('[POST /api/cart/reserve]', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server saat hold stok' }, { status: 500 })
  }
}
