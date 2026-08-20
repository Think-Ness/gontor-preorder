import { NextRequest, NextResponse } from 'next/server'
import { streamFromDrive } from '@/lib/google-drive'
import { Readable } from 'stream'

export const maxDuration = 30

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params
  
  try {
    const { stream, mimeType, filename } = await streamFromDrive(fileId)

    // Convert Node stream to web ReadableStream
    const webStream = Readable.toWeb(stream as Readable) as ReadableStream

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
        // Cache aggressively at the edge to reduce Google Drive API hits
        'Cache-Control': 'public, s-maxage=31536000, max-age=31536000, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[drive/public-preview]', err)
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })
  }
}
