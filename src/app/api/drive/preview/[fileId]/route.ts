import { NextRequest, NextResponse } from 'next/server'
import { streamFromDrive } from '@/lib/google-drive'
import { createClient } from '@/lib/supabase/server'
import { Readable } from 'stream'

export const maxDuration = 30

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params
  
  // Verify admin auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { stream, mimeType, filename } = await streamFromDrive(fileId)

    // Convert Node stream to web ReadableStream
    const webStream = Readable.toWeb(stream as Readable) as ReadableStream

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[drive/preview]', err)
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })
  }
}
