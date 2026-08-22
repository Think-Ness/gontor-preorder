import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { role, pin } = await req.json()
    const supabase = await createAdminClient()

    const { data: settings } = await supabase
      .from('event_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    let expectedPin = '1234'
    if (role === 'vendor') expectedPin = settings?.pin_vendor || '1234'
    else if (role === 'stand') expectedPin = settings?.pin_stand || '1234'
    else if (role === 'delivery') expectedPin = settings?.pin_delivery || '1234'

    if (pin && pin.trim() === expectedPin.trim()) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'PIN Keamanan Salah! Hubungi Panitia Admin.' },
        { status: 401 }
      )
    }
  } catch (err) {
    console.error('[POST /api/display/auth]', err)
    return NextResponse.json({ error: 'Gagal memverifikasi PIN' }, { status: 500 })
  }
}
