import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { uploadToDrive } from '@/lib/google-drive'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { sanitizeFilename } from '@/lib/utils'

export const maxDuration = 30

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user || !checkIsAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File bukti pembayaran wajib dipilih' }, { status: 400 })
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format file harus berupa gambar (JPG, PNG, WebP)' }, { status: 400 })
    }

    // Validate size (5 MB default)
    const maxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 5)
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json({ error: `Ukuran file melebihi ${maxMb} MB` }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: order, error: findErr } = await supabase
      .from('orders')
      .select('id, full_name, order_number, payment_status, order_status')
      .eq('id', orderId)
      .single()

    if (findErr || !order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const baseName = sanitizeFilename(order.full_name || 'Customer')
    const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
    const filename = `BuktiTransfer_AdminReupload_${baseName}_${timestamp}.${ext}`

    const folderId = process.env.GOOGLE_DRIVE_PAYMENT_FOLDER_ID!

    const { fileId } = await uploadToDrive({
      fileBuffer: buffer,
      filename,
      mimeType: file.type,
      folderId,
    })

    const updatePayload: Record<string, any> = {
      payment_proof_file_id: fileId,
      payment_proof_filename: filename,
      payment_proof_mime_type: file.type,
      payment_proof_size: file.size,
      payment_proof_uploaded_at: new Date().toISOString(),
    }

    // If order was REJECTED or UNPAID, automatically move it to PROOF_UPLOADED / PAYMENT_REVIEW
    if (order.payment_status === 'REJECTED' || order.payment_status === 'UNPAID') {
      updatePayload.payment_status = 'PROOF_UPLOADED'
      updatePayload.order_status = 'PAYMENT_REVIEW'
      updatePayload.admin_note = null
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id)

    if (updateErr) {
      return NextResponse.json({ error: 'Gagal memperbarui bukti transfer di database' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Bukti transfer baru berhasil diupload!',
      payment_proof_file_id: fileId,
      payment_proof_url: buildDriveImageUrl(fileId),
      payment_proof_filename: filename,
    })
  } catch (err) {
    console.error('[POST /api/admin/orders/[orderId]/reupload-proof]', err)
    return NextResponse.json({ error: 'Gagal mengupload ulang bukti transfer' }, { status: 500 })
  }
}
