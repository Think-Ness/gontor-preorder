import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID wajib diisi' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data: result, error } = await supabase.rpc('release_cart_stock', {
      p_session_id: sessionId,
    })

    if (error) {
      console.error('[POST /api/cart/release] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/cart/release]', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server saat melepaskan stok' }, { status: 500 })
  }
}
