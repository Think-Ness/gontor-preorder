'use client'

import { useState, useEffect, useCallback } from 'react'
import { Cart, CartItem } from '@/types'
import { generateCartItemId } from '@/lib/utils'

const CART_KEY = 'gontor_cart'

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

function loadCart(): Cart {
  if (typeof window === 'undefined') return { items: [], subtotal: 0 }
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return { items: [], subtotal: 0 }
    const items: CartItem[] = JSON.parse(raw)
    return { items, subtotal: calcSubtotal(items) }
  } catch {
    return { items: [], subtotal: 0 }
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0 })

  // Load from localStorage on mount
  useEffect(() => {
    setCart(loadCart())
  }, [])

  const updateCart = useCallback((items: CartItem[]) => {
    saveCart(items)
    setCart({ items, subtotal: calcSubtotal(items) })
  }, [])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setCart(prev => {
      const items = [...prev.items]

      // Find existing item with same product/variant/package
      const existingIdx = items.findIndex(item => {
        if (newItem.itemType === 'PACKAGE') return item.packageId === newItem.packageId
        if (newItem.itemType === 'VARIANT') return item.variantId === newItem.variantId
        return item.productId === newItem.productId && item.itemType === 'PRODUCT'
      })

      if (existingIdx >= 0) {
        const currentQty = items[existingIdx].quantity
        const max = newItem.maxStock !== undefined ? newItem.maxStock : items[existingIdx].maxStock
        if (max !== undefined && max !== null && currentQty >= max) {
          // Cannot exceed stock
          return prev
        }
        items[existingIdx] = {
          ...items[existingIdx],
          quantity: max !== undefined && max !== null ? Math.min(currentQty + 1, max) : currentQty + 1,
          maxStock: max,
        }
      } else {
        const max = newItem.maxStock
        const qty = max !== undefined && max !== null ? Math.min(newItem.quantity, Math.max(1, max)) : newItem.quantity
        items.push({ ...newItem, quantity: qty, id: generateCartItemId() })
      }

      saveCart(items)
      return { items, subtotal: calcSubtotal(items) }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setCart(prev => {
      const items = prev.items.filter(i => i.id !== id)
      saveCart(items)
      return { items, subtotal: calcSubtotal(items) }
    })
  }, [])

  const updateQuantity = useCallback((id: string, qty: number) => {
    setCart(prev => {
      const items = prev.items.map(i => {
        if (i.id !== id) return i
        let targetQty = Math.max(1, qty)
        if (i.maxStock !== undefined && i.maxStock !== null) {
          targetQty = Math.min(targetQty, i.maxStock)
        }
        return { ...i, quantity: targetQty }
      })
      saveCart(items)
      return { items, subtotal: calcSubtotal(items) }
    })
  }, [])

  const clearCart = useCallback(() => {
    updateCart([])
  }, [updateCart])

  return { cart, addItem, removeItem, updateQuantity, clearCart }
}
