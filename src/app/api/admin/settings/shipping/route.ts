import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createAdminClient()

    const { data: current } = await supabase.from('event_settings').select('id').single()

    if (current) {
      const { error } = await supabase
        .from('event_settings')
        .update({
          allow_pickup: body.allow_pickup ?? true,
          allow_delivery: body.allow_delivery ?? true,
          default_shipping_fee: Number(body.default_shipping_fee || 0),
          pickup_location_note: body.pickup_location_note || 'Stand Merchandise Utama 100 Tahun Gontor',
        })
        .eq('id', current.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/admin/settings/shipping]', err)
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan pengiriman' }, { status: 500 })
  }
}
