import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkIsAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()

    const { data: current } = await supabase
      .from('event_settings')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    const couriersStr = body.couriers
      ? typeof body.couriers === 'string'
        ? body.couriers
        : JSON.stringify(body.couriers)
      : null

    const updates: Record<string, any> = {
      allow_pickup: body.allow_pickup ?? true,
      allow_delivery: body.allow_delivery ?? true,
      default_shipping_fee: Number(body.default_shipping_fee || 0),
      pickup_location_note: body.pickup_location_note || 'Stand Merchandise Utama 100 Tahun Gontor (Depan Balai Pertemuan)',
      allowed_couriers: couriersStr,
    }

    let error: any = null

    if (current?.id) {
      const res = await supabase.from('event_settings').update(updates).eq('id', current.id)
      error = res.error
    } else {
      const res = await supabase.from('event_settings').insert(updates)
      error = res.error
    }

    // Fallback if allowed_couriers column doesn't exist yet
    if (error && (error.message?.includes('allowed_couriers') || error.code === 'PGRST204')) {
      delete updates.allowed_couriers
      if (current?.id) {
        const retry = await supabase.from('event_settings').update(updates).eq('id', current.id)
        error = retry.error
      } else {
        const retry = await supabase.from('event_settings').insert(updates)
        error = retry.error
      }
    }

    if (error) {
      console.error('[POST /api/admin/settings/shipping] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/admin/settings/shipping]', err)
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan pengiriman' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createAdminClient()
    const { data: settings } = await supabase
      .from('event_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!settings) return NextResponse.json({})

    let parsedCouriers = null
    if (settings.allowed_couriers) {
      try {
        parsedCouriers = typeof settings.allowed_couriers === 'string'
          ? JSON.parse(settings.allowed_couriers)
          : settings.allowed_couriers
      } catch (e) {
        parsedCouriers = null
      }
    }

    return NextResponse.json({
      ...settings,
      couriers: parsedCouriers,
    })
  } catch (err) {
    console.error('[GET /api/admin/settings/shipping]', err)
    return NextResponse.json({}, { status: 500 })
  }
}
