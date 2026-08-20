import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { paymentMethodSchema } from '@/lib/validations/schemas'

export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()

    const body = await req.json()
    const parsed = paymentMethodSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Data tidak valid' }, { status: 400 })
    }

    const { id, ...data } = body

    const { error } = id
      ? await supabase.from('payment_methods').update(data).eq('id', id)
      : await supabase.from('payment_methods').insert(data)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/admin/settings/payment]', err)
    return NextResponse.json({ error: 'Gagal menyimpan rekening' }, { status: 500 })
  }
}
