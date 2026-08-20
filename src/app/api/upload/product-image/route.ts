import { NextRequest, NextResponse } from 'next/server'
import { uploadToDrive } from '@/lib/google-drive'
import { buildDriveImageUrl } from '@/lib/drive-urls'
import { sanitizeFilename } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // Verify admin auth via session cookies
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format tidak didukung' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File terlalu besar (maks 10 MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const productName = formData.get('product_name') as string | null
    const baseName = productName ? sanitizeFilename(productName) : sanitizeFilename(file.name.replace(/\.[^.]+$/, ''))
    
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const filename = `${baseName}_${Date.now()}.${ext}`

    const folderId = process.env.GOOGLE_DRIVE_PRODUCTS_FOLDER_ID!

    const { fileId } = await uploadToDrive({
      fileBuffer: buffer,
      filename,
      mimeType: file.type,
      folderId,
    })

    return NextResponse.json({
      file_id: fileId,
      url: buildDriveImageUrl(fileId),
      filename,
    })
  } catch (err) {
    console.error('[upload/product-image]', err)
    const msg = err instanceof Error ? err.message : 'Upload gagal'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
