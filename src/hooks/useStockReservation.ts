'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CartItem } from '@/types'

interface UseStockReservationProps {
  sessionId: string | null
  cartItems: CartItem[]
  step: number
}

export function useStockReservation({ sessionId, cartItems, step }: UseStockReservationProps) {
  const [isReserved, setIsReserved] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [reservationError, setReservationError] = useState<string | null>(null)
  const [isReserving, setIsReserving] = useState(false)

  const activeSessionRef = useRef<string | null>(sessionId)
  activeSessionRef.current = sessionId

  // Reserve stock API call
  const reserveStock = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!sessionId || cartItems.length === 0) {
      return { success: false, error: 'Keranjang kosong atau session tidak valid' }
    }

    setIsReserving(true)
    setReservationError(null)

    try {
      const response = await fetch('/api/cart/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          items: cartItems.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            packageId: i.packageId,
            itemType: i.itemType,
            quantity: i.quantity,
          })),
          ttlMinutes: 15,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Stok produk tidak mencukupi untuk di-hold.'
        setReservationError(errorMsg)
        setIsReserved(false)
        return { success: false, error: errorMsg }
      }

      setIsReserved(true)
      setExpiresAt(data.expires_at)
      setIsExpired(false)
      setReservationError(null)

      // Calculate initial seconds remaining
      const expiry = new Date(data.expires_at).getTime()
      const now = Date.now()
      const secs = Math.max(0, Math.floor((expiry - now) / 1000))
      setSecondsRemaining(secs)

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghubungi server untuk mengunci stok.'
      setReservationError(errorMsg)
      setIsReserved(false)
      return { success: false, error: errorMsg }
    } finally {
      setIsReserving(false)
    }
  }, [sessionId, cartItems])

  // Release stock API call
  const releaseStock = useCallback(async () => {
    const sid = activeSessionRef.current
    if (!sid) return

    try {
      await fetch('/api/cart/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      })
    } catch {
      // Ignore release errors
    } finally {
      setIsReserved(false)
      setExpiresAt(null)
      setSecondsRemaining(null)
      setIsExpired(false)
    }
  }, [])

  // Handle Step 4 Enter & Leave
  useEffect(() => {
    if (step === 4 && sessionId && cartItems.length > 0) {
      reserveStock()
    } else if (step !== 4 && isReserved) {
      releaseStock()
    }
  }, [step, sessionId, cartItems.length, reserveStock, isReserved, releaseStock])

  // Countdown timer effect
  useEffect(() => {
    if (!expiresAt || !isReserved) return

    const interval = setInterval(() => {
      const expiry = new Date(expiresAt).getTime()
      const now = Date.now()
      const diff = Math.floor((expiry - now) / 1000)

      if (diff <= 0) {
        setSecondsRemaining(0)
        setIsExpired(true)
        setIsReserved(false)
        clearInterval(interval)
      } else {
        setSecondsRemaining(diff)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, isReserved])

  // Format MM:SS helper
  const formatRemainingTime = useCallback(() => {
    if (secondsRemaining === null) return '15:00'
    const mins = Math.floor(secondsRemaining / 60)
    const secs = secondsRemaining % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [secondsRemaining])

  return {
    isReserved,
    expiresAt,
    secondsRemaining,
    isExpired,
    reservationError,
    isReserving,
    reserveStock,
    releaseStock,
    formatRemainingTime,
  }
}
