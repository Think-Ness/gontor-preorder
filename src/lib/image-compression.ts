/**
 * Compresses an image file client-side before uploading to Vercel/server.
 * Max dimension: 1600px, quality: 0.85.
 * Converts large 5-10MB photos into ~200-400KB JPEG files.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<File> {
  // If file is non-image or already very small (< 400 KB), return as is
  if (!file.type.startsWith('image/') || file.size <= 400 * 1024) {
    return file
  }

  return new Promise((resolve) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(file)

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file)
          const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
}

/**
 * Safely parse JSON response from fetch API, gracefully handling HTML error responses (like Vercel 413 Payload Too Large).
 */
export async function safeParseJsonResponse(res: Response): Promise<any> {
  const text = await res.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    if (!res.ok) {
      if (res.status === 413 || text.includes('Request Entity Too Large') || text.includes('413')) {
        throw new Error('Ukuran foto terlalu besar (maksimum 4.5 MB di Vercel). Silakan gunakan foto yang lebih kecil.')
      }
      throw new Error(`Terjadi kesalahan server (${res.status}). Silakan coba lagi.`)
    }
    throw new Error('Respons server tidak valid')
  }

  if (!res.ok) {
    throw new Error(data.error || `Upload gagal (${res.status})`)
  }

  return data
}
