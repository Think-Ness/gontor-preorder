// Client-safe Drive URL utilities (no Node.js dependencies)
// This file is safe to import from both client and server components

export function buildDriveImageUrl(fileId: string): string {
  // Use our Next.js edge-cached proxy route to bypass Google Workspace sharing restrictions
  // This ensures the image loads perfectly in <Image> tags without 403s
  return `/api/drive/public-preview/${fileId}`
}

export function buildDrivePreviewUrl(fileId: string): string {
  return `/api/drive/public-preview/${fileId}`
}

export function buildAdminProofPreviewUrl(fileId: string): string {
  // We can just use the public one since we want it to render in an <img> tag easily,
  // or keep it restricted if payment proofs are highly sensitive.
  // Actually, keeping payment proofs restricted is better for privacy.
  return `/api/drive/preview/${fileId}`
}
