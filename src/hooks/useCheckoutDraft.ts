'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckoutDraft, CartItem, FulfillmentMethod } from '@/types'
import { generateSessionId } from '@/lib/utils'

const DRAFT_KEY = 'gontor_checkout_draft'
const SESSION_KEY = 'gontor_checkout_session'

export function useCheckoutDraft() {
  const [draft, setDraft] = useState<CheckoutDraft | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Load or create session ID
    let sid = sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = generateSessionId()
      sessionStorage.setItem(SESSION_KEY, sid)
    }
    setSessionId(sid)

    // Load draft
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) setDraft(JSON.parse(raw))
    } catch {}
    setIsLoaded(true)
  }, [])

  const saveDraft = useCallback((updates: Partial<CheckoutDraft>) => {
    setDraft(prev => {
      const now = new Date().toISOString()
      const next: CheckoutDraft = {
        ...(prev ?? {
          draftId: generateSessionId(),
          stambuk: '',
          name: '',
          generationYear: '',
          whatsapp: '',
          fulfillmentMethod: null,
          address: {
            fullAddress: '',
            village: '',
            district: '',
            city: '',
            province: '',
            postalCode: '',
          },
          cart: [],
          paymentStep: 0,
          createdAt: now,
          updatedAt: now,
        }),
        ...updates,
        updatedAt: now,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setDraft(null)
    // Generate new session
    const sid = generateSessionId()
    sessionStorage.setItem(SESSION_KEY, sid)
    setSessionId(sid)
  }, [])

  return { draft, saveDraft, clearDraft, sessionId, isLoaded }
}
