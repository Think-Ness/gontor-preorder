import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createAdminClient()

  const body = await req.json()
  const {
    id, event_name, event_description,
    preorder_start, preorder_end, timezone,
    is_active, favicon_url,
    footer_tagline, footer_hashtags,
    contact_whatsapp, social_instagram,
    pin_vendor, pin_stand, pin_delivery,
  } = body

  const updates: Record<string, any> = {
    event_name,
    event_description: event_description || null,
    preorder_start: preorder_start ? new Date(preorder_start).toISOString() : null,
    preorder_end: preorder_end ? new Date(preorder_end).toISOString() : null,
    timezone,
    is_active,
    favicon_url: favicon_url || null,
    footer_tagline: footer_tagline || null,
    footer_hashtags: footer_hashtags || null,
    contact_whatsapp: contact_whatsapp || null,
    social_instagram: social_instagram || null,
    pin_vendor: pin_vendor || '1234',
    pin_stand: pin_stand || '1234',
    pin_delivery: pin_delivery || '1234',
  }

  let { error } = id
    ? await supabase.from('event_settings').update(updates).eq('id', id)
    : await supabase.from('event_settings').insert(updates)

  // Safe fallback if column pin_* does not exist in database table yet
  if (error && (error.message?.includes('pin_') || error.code === 'PGRST204')) {
    delete updates.pin_vendor
    delete updates.pin_stand
    delete updates.pin_delivery
    const retry = id
      ? await supabase.from('event_settings').update(updates).eq('id', id)
      : await supabase.from('event_settings').insert(updates)
    error = retry.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Revalidate public landing page and checkout page so changes take effect immediately
  try {
    revalidatePath('/')
    revalidatePath('/order')
  } catch (e) {
    // Ignore cache error
  }

  return NextResponse.json({ success: true })
}

