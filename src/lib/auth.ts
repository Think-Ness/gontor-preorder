import { User } from '@supabase/supabase-js'

/**
 * Checks if a given user has administrative privileges.
 * Validates against the @gontor.ac.id domain and ADMIN_EMAILS environment variable.
 */
export function checkIsAdmin(user: User | null): boolean {
  if (!user || !user.email) return false
  
  const email = user.email.toLowerCase()
  
  // 1. Check if email ends with the institution domain
  if (email.endsWith('@gontor.ac.id')) {
    return true
  }
  
  // 2. Check if email is explicitly listed in ADMIN_EMAILS environment variable
  const adminEmails = process.env.ADMIN_EMAILS 
    ? process.env.ADMIN_EMAILS.toLowerCase().split(',').map(e => e.trim())
    : []
    
  if (adminEmails.includes(email)) {
    return true
  }
  
  return false
}
