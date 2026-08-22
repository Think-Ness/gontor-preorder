import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { packageSchema } from '@/lib/validations/schemas'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  const { packageId } = await params
  const supabase = await createAdminClient()

  const { data: pkg, error } = await supabase
    .from('packages')
    .select('*, items:package_items(*)')
    .eq('id', packageId)
    .single()

  if (error || !pkg) return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 })

  return NextResponse.json({ data: pkg })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const { packageId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const body = await req.json()
    const parsed = packageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Data tidak valid' }, { status: 400 })
    }

    const { items, ...pkgData } = parsed.data

    const { error: updateErr } = await supabase
      .from('packages')
      .update(pkgData)
      .eq('id', packageId)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/admin/packages/[packageId]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui paket' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    const { packageId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createAdminClient()
    const { error } = await supabase.from('packages').delete().eq('id', packageId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/packages/[packageId]]', err)
    return NextResponse.json({ error: 'Gagal menghapus paket' }, { status: 500 })
  }
}
