import { NextRequest, NextResponse } from 'next/server'
import { uploadToDrive } from '@/lib/google-drive'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { sanitizeFilename } from '@/lib/utils'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung' }, { status: 400 })
    }

    // Validate size (5 MB default)
    const maxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 5)
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json({ error: `Ukuran file melebihi ${maxMb} MB` }, { status: 400 })
    }

    const customerName = formData.get('customer_name') as string | null
    const buffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const baseName = customerName ? sanitizeFilename(customerName) : sanitizeFilename(file.name.replace(/\.[^.]+$/, ''))
    const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
    const filename = `BuktiTransfer_${baseName}_${timestamp}.${ext}`

    const folderId = process.env.GOOGLE_DRIVE_PAYMENT_FOLDER_ID!

    const { fileId, webViewLink } = await uploadToDrive({
      fileBuffer: buffer,
      filename,
      mimeType: file.type,
      folderId,
    })

    return NextResponse.json({
      payment_proof_file_id: fileId,
      payment_proof_url: buildDriveImageUrl(fileId),
      payment_proof_filename: filename,
      payment_proof_mime_type: file.type,
      payment_proof_size: file.size,
    })
  } catch (err) {
    console.error('[upload/payment-proof]', err)
    const msg = err instanceof Error ? err.message : 'Bukti pembayaran belum berhasil disimpan.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
