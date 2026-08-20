import type { Order } from '@/types'

interface ShippingLabelProps {
  order: Order
}

export default function ShippingLabelA5({ order }: ShippingLabelProps) {
  // Filter out any kurir/maps pin text from address if present
  let cleanAddress = order.shipping_address || ''
  cleanAddress = cleanAddress.replace(/\[Kurir:.*?\]/g, '')
  cleanAddress = cleanAddress.replace(/\[Map Pin:.*?\]/g, '')

  // Format phone number
  const phone = order.whatsapp || '-'

  // Generate QR code URL
  // Domain is hardcoded for now or we can just use order_number for track
  const qrData = encodeURIComponent(`Order: ${order.order_number}`)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`

  return (
    <div className="w-[210mm] h-[148mm] bg-white text-black p-8 relative shadow-lg print:shadow-none overflow-hidden"
         style={{ pageBreakAfter: 'always' }}>
      
      {/* Background Watermark/Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-bl-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50 rounded-tr-full -z-10"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-green-700">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="w-14 h-14 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">
            G
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight text-green-900 leading-tight">
              Reunion Kit 100 Tahun Gontor
            </h1>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">
              Label Pengiriman Resmi
            </p>
          </div>
        </div>
        
        {/* QR Code */}
        <div className="flex flex-col items-end gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR Code" className="w-16 h-16 object-contain" />
          <span className="font-mono text-xs font-bold text-gray-800">{order.order_number}</span>
        </div>
      </div>

      {/* Sender and Receiver Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Pengirim */}
        <div>
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">
            Pengirim
          </h2>
          <div className="font-bold text-base text-gray-900 mb-1">Panitia 100 Tahun Gontor</div>
          <div className="text-sm text-gray-700 leading-relaxed">
            Pondok Modern Darussalam Gontor<br />
            Ponorogo, Jawa Timur
          </div>
        </div>

        {/* Penerima */}
        <div>
          <h2 className="text-[11px] font-bold text-green-700 uppercase tracking-widest mb-2 border-b border-green-200 pb-1">
            Penerima
          </h2>
          <div className="font-bold text-lg text-gray-900 mb-1">{order.full_name}</div>
          <div className="text-sm font-semibold text-gray-800 mb-1">
            WA: {phone}
          </div>
          <div className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {cleanAddress}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">
          Rincian Pesanan
        </h2>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <ul className="space-y-1.5 columns-2 gap-x-6">
            {order.items?.map((item, idx) => {
              const displayName = item.variant_name_snapshot 
                ? `${item.item_name_snapshot} - ${item.variant_name_snapshot}` 
                : item.item_name_snapshot;
                
              return (
                <li key={idx} className="text-sm text-gray-800 flex items-start gap-2 break-inside-avoid">
                  <span className="font-bold text-green-700 min-w-[24px]">x{item.quantity}</span>
                  <span className="leading-tight">{displayName}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      
      {/* Footer cut line */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center text-[10px] text-gray-400 font-mono tracking-widest print:hidden">
        ✂ ----------------------------------------------------- ✂
      </div>
    </div>
  )
}
