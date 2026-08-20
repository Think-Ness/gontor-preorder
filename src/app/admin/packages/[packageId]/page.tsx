import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditPackageClient from './EditPackageClient'

export const metadata: Metadata = { title: 'Edit Paket' }

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ packageId: string }>
}) {
  const { packageId } = await params
  const supabase = await createAdminClient()

  const { data: pkg } = await supabase
    .from('packages')
    .select('*, items:package_items(*)')
    .eq('id', packageId)
    .single()

  if (!pkg) notFound()

  return <EditPackageClient initialPackage={pkg} />
}
