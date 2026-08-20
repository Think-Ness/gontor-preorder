import 'server-only'
import { google } from 'googleapis'
import { Readable } from 'stream'

function getAuth() {
  // If OAuth2 credentials are provided, use them (this bypasses Service Account quota limits)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    )
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    })
    return oauth2Client
  }

  // Fallback to Service Account
  let key = (process.env.GOOGLE_PRIVATE_KEY || '').trim()
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.substring(1, key.length - 1)
  }
  key = key.replace(/\\n/g, '\n')

  const credentials = {
    client_email: (process.env.GOOGLE_CLIENT_EMAIL || '').trim(),
    private_key: key,
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
}

function getDriveClient() {
  return google.drive({ version: 'v3', auth: getAuth() })
}

// ============================================================
// Upload a file to Google Drive
// ============================================================
export async function uploadToDrive({
  fileBuffer,
  filename,
  mimeType,
  folderId,
}: {
  fileBuffer: Buffer
  filename: string
  mimeType: string
  folderId: string
}): Promise<{ fileId: string; webViewLink: string | null }> {
  const drive = getDriveClient()

  const readable = new Readable()
  readable.push(fileBuffer)
  readable.push(null)

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: folderId ? [folderId] : undefined,
    },
    media: {
      mimeType,
      body: readable,
    },
    supportsAllDrives: true,
    fields: 'id,webViewLink',
  })

  if (!response.data.id) {
    throw new Error('Google Drive upload failed: no file ID returned')
  }

  try {
    await drive.permissions.create({
      fileId: response.data.id,
      supportsAllDrives: true,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })
  } catch (permErr) {
    console.warn('[uploadToDrive] Skipping permission setting:', permErr)
  }

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink ?? null,
  }
}

// ============================================================
// Stream a file from Google Drive (for admin preview)
// ============================================================
export async function streamFromDrive(fileId: string): Promise<{
  stream: NodeJS.ReadableStream
  mimeType: string
  filename: string
}> {
  const drive = getDriveClient()

  // Get file metadata
  const meta = await drive.files.get({
    fileId,
    supportsAllDrives: true,
    fields: 'mimeType,name',
  })

  const mimeType = meta.data.mimeType ?? 'application/octet-stream'
  const filename = meta.data.name ?? 'file'

  // Download file
  const response = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  )

  return {
    stream: response.data as unknown as NodeJS.ReadableStream,
    mimeType,
    filename,
  }
}

// ============================================================
// Delete a file from Google Drive
// ============================================================
export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient()
  await drive.files.delete({ fileId, supportsAllDrives: true })
}


