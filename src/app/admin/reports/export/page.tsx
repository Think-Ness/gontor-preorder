'use client'

import { useState } from 'react'
import { FileSpreadsheet, Filter, Boxes } from 'lucide-react'

export default function ExportDataPage() {
  const [status, setStatus] = useState('ALL')

  const handleDownload = (type: 'orders' | 'items' | 'recap') => {
    const url = `/api/admin/export?type=${type}&status=${status}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Export Data Laporan (Excel .xlsx)</h1>
        <p className="text-gray-500 text-sm">Unduh data pesanan & item rekapitulasi langsung dalam format Spreadsheet Microsoft Excel (.xlsx) yang rapi</p>
      </div>

      <div className="card-premium p-6 space-y-6">
        {/* Filter Option */}
        <div>
          <label className="block font-display font-bold text-sm text-gray-800 mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4 text-green-700" />
            Filter Berdasarkan Status Pesanan:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'ALL', label: 'Semua Status' },
              { id: 'PAID', label: 'Lunas (PAID)' },
              { id: 'PROCESSING', label: 'Diproses' },
              { id: 'READY_FOR_PICKUP', label: 'Siap Stand' },
              { id: 'SHIPPED', label: 'Dikirim' },
              { id: 'COMPLETED', label: 'Selesai' },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatus(st.id)}
                className={`py-2.5 px-3 rounded-xl font-display font-semibold text-xs border transition-all ${
                  status === st.id
                    ? 'bg-green-700 text-white border-green-700 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Download Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Action 1: Rekap Produksi & Distribusi */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between space-y-4">
            <div>
              <Boxes className="w-8 h-8 text-amber-700 mb-2" />
              <h2 className="font-display font-bold text-base text-gray-900">Rekap Vendor & Distribusi (.xlsx)</h2>
              <p className="text-xs text-gray-600 mt-1">
                Format khusus Vendor & Tim Lapangan: Total Majmuk Vendor, Qty Alokasi Stand Bazar, dan Qty Alokasi Kirim Ekspedisi.
              </p>
            </div>

            <button
              onClick={() => handleDownload('recap')}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-display font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Rekap Vendor & Stand
            </button>
          </div>

          {/* Action 2: Export Orders */}
          <div className="p-5 rounded-2xl bg-green-50/70 border border-green-100 flex flex-col justify-between space-y-4">
            <div>
              <FileSpreadsheet className="w-8 h-8 text-green-700 mb-2" />
              <h2 className="font-display font-bold text-base text-gray-900">Laporan Pesanan Lengkap (.xlsx)</h2>
              <p className="text-xs text-gray-600 mt-1">
                Format Excel rapi berisi: Nomor Order, Stambuk, Nama, WhatsApp, Email, Alamat Pengiriman, Total Pembayaran, dan Status.
              </p>
            </div>

            <button
              onClick={() => handleDownload('orders')}
              className="btn-primary w-full py-3 text-xs font-display font-bold flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel Pesanan ({status})
            </button>
          </div>

          {/* Action 3: Export Order Items */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between space-y-4">
            <div>
              <FileSpreadsheet className="w-8 h-8 text-blue-600 mb-2" />
              <h2 className="font-display font-bold text-base text-gray-900">Rincian Per Item Produk (.xlsx)</h2>
              <p className="text-xs text-gray-600 mt-1">
                Format Excel rapi berisi: Nama Pemesan, Nama Produk, Ukuran / Varian, Qty, Harga Satuan, Subtotal, dan Metode Fulfillment.
              </p>
            </div>

            <button
              onClick={() => handleDownload('items')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-display font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Rincian Item Produk
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
