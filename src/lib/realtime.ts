import { createClient } from '@/lib/supabase/client'

const REALTIME_CHANNEL_NAME = 'gontor_orders_realtime_sync'

/**
 * Broadcasts an instant order update message via BroadcastChannel (local browser tabs)
 */
export function broadcastOrderUpdate() {
  if (typeof window !== 'undefined') {
    try {
      const bc = new BroadcastChannel(REALTIME_CHANNEL_NAME)
      bc.postMessage('ORDER_UPDATED')
      bc.close()
    } catch {
      // Ignore if BroadcastChannel is not supported
    }
  }
}

/**
 * Subscribes to Supabase Realtime WebSocket changes for `orders` and `order_items` tables,
 * plus multi-tab BroadcastChannel sync for 0ms local update.
 */
export function subscribeToOrdersRealtime(onUpdate: () => void) {
  const supabase = createClient()

  // 1. Supabase Postgres CDC (WebSocket) Realtime Channel
  const channel = supabase
    .channel('public-orders-realtime-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      () => {
        onUpdate()
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'order_items' },
      () => {
        onUpdate()
      }
    )
    .subscribe()

  // 2. Multi-tab BroadcastChannel for 0ms instant local tab sync
  let bc: BroadcastChannel | null = null
  if (typeof window !== 'undefined') {
    try {
      bc = new BroadcastChannel(REALTIME_CHANNEL_NAME)
      bc.onmessage = (event) => {
        if (event.data === 'ORDER_UPDATED') {
          onUpdate()
        }
      }
    } catch {
      // Ignore
    }
  }

  // Cleanup function
  return () => {
    supabase.removeChannel(channel)
    if (bc) bc.close()
  }
}

/**
 * Subscribes to Supabase Realtime WebSocket changes for `products`, `product_variants`,
 * and `cart_reservations` tables to notify when stock or reservations change.
 */
export function subscribeToStockRealtime(onStockChange: () => void) {
  const supabase = createClient()

  const channel = supabase
    .channel('public-stock-realtime-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => onStockChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'product_variants' },
      () => onStockChange()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cart_reservations' },
      () => onStockChange()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

