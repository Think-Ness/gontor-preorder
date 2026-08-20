import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function proxy(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const url = req.nextUrl.clone()
  const isAdminRoute = url.pathname.startsWith('/admin') && url.pathname !== '/admin/login'

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', url.pathname)

  if (isAdminRoute && !user) {
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (url.pathname === '/admin/login' && user) {
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}
