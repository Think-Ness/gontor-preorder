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
      <div className="print:hidden fixed top-6 right-6 z-50 flex gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 items-center animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="text-sm font-bold text-gray-500 mr-2 flex flex-col items-end">
          <span className="text-gray-900">Siap Cetak?</span>
          <span className="text-xs font-normal">Pastikan kertas A5 Lanskap</span>
        </div>
        <button 
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-green-600 via-green-700 to-green-900 hover:from-green-500 hover:via-green-600 hover:to-green-800 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all transform hover:scale-105 active:scale-95 group relative overflow-hidden"
          id="print-btn"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span className="relative z-10">CETAK SEKARANG</span>
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
