import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { uploadToDrive } from '@/lib/google-drive'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { sanitizeFilename } from '@/lib/utils'
import { sendOrderReceivedEmail } from '@/lib/email'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const orderNumber = (formData.get('order_number') as string | null)?.trim()
    const orderId = (formData.get('order_id') as string | null)?.trim()

    if (!file) {
      return NextResponse.json({ error: 'File bukti transfer wajib diisi' }, { status: 400 })
    }

    if (!orderNumber && !orderId) {
      return NextResponse.json({ error: 'Order ID atau Nomor Order wajib diisi' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Find order
    let query = supabase.from('orders').select('*, items:order_items(*)')
    if (orderId) {
      query = query.eq('id', orderId)
    } else if (orderNumber) {
      query = query.eq('order_number', orderNumber)
    }

    const { data: order, error: findErr } = await query.single()

    if (findErr || !order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
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

    const buffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const baseName = sanitizeFilename(order.full_name || 'Customer')
    const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
    const filename = `BuktiTransfer_Reupload_${baseName}_${timestamp}.${ext}`

    const folderId = process.env.GOOGLE_DRIVE_PAYMENT_FOLDER_ID!

    const { fileId } = await uploadToDrive({
      fileBuffer: buffer,
      filename,
      mimeType: file.type,
      folderId,
    })

    // Update order status back to PAYMENT_REVIEW
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_proof_file_id: fileId,
        payment_proof_filename: filename,
        payment_status: 'PROOF_UPLOADED',
        order_status: 'PAYMENT_REVIEW',
        admin_note: null,
      })
      .eq('id', order.id)

    if (updateErr) {
      return NextResponse.json({ error: 'Gagal memperbarui bukti transfer di database' }, { status: 500 })
    }

    // Notify buyer via email
    if (order.email) {
      const emailItems = (order.items ?? []).map((i: any) => ({
        name: i.item_name_snapshot,
        variantName: i.variant_name_snapshot,
        unitPrice: Number(i.unit_price_snapshot),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      }))

      try {
        await sendOrderReceivedEmail(order.email, {
          orderNumber: order.order_number,
          fullName: order.full_name,
          totalAmount: Number(order.total_amount),
          items: emailItems,
        })
      } catch (e) {
        console.error('Re-upload email notification error:', e)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bukti transfer baru berhasil di-upload!',
      payment_proof_file_id: fileId,
      payment_proof_url: buildDriveImageUrl(fileId),
    })
  } catch (err) {
    console.error('[POST /api/orders/reupload]', err)
    return NextResponse.json({ error: 'Gagal mengupload ulang bukti transfer' }, { status: 500 })
  }
}
