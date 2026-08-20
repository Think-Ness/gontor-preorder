import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import ShippingLabelA5 from '@/components/admin/ShippingLabelA5'

export const metadata: Metadata = { title: 'Print Label Pengiriman' }
export const revalidate = 0

export default async function PrintDeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const params = await searchParams
  const ids = params.ids?.split(',').filter(Boolean)

  if (!ids || ids.length === 0) {
    return <div className="p-10 text-center">Pilih pesanan terlebih dahulu.</div>
  }

  const supabase = await createAdminClient()
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .in('id', ids)
    .order('created_at', { ascending: false })

  if (error || !orders) {
    return <div className="p-10 text-center text-red-600">Gagal memuat pesanan.</div>
  }

  return (
    <div className="bg-gray-100 min-h-screen print:bg-white">
      {/* Tombol Print (Sembunyikan saat dicetak) */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <button 
          className="btn-primary"
          id="print-btn"
        >
          Cetak Sekarang
        </button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-btn').addEventListener('click', function() {
              window.print();
            });
          `
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: A5 landscape;
              margin: 0;
            }
            body {
              background: white;
            }
            /* Hide next.js app wrappers if any */
            #__next {
              background: white;
            }
          }
        `
      }} />

      {/* Render Labels */}
      <div className="print:m-0 flex flex-col items-center gap-8 py-8 print:py-0 print:gap-0">
        {orders.map((order, idx) => (
          <ShippingLabelA5 key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
}
