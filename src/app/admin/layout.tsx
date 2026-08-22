import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper'
import { checkIsAdmin } from '@/lib/auth'

export const metadata: Metadata = {
  title: { default: 'Admin Panel', template: '%s — Admin Gontor Pre-Order' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !checkIsAdmin(user)) redirect('/admin/login')

  return (
    <AdminLayoutWrapper user={user}>
      {children}
    </AdminLayoutWrapper>
  )
}
