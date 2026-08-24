'use client'

import { useState, useEffect } from 'react'
import { SizeChart } from '@/types'
import { X, Ruler, Loader2, Check, AlertCircle } from 'lucide-react'

interface BulkSizeChartModalProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  selectedNames: string[]
  onSuccess: () => void
}

export default function BulkSizeChartModal({
  isOpen,
  onClose,
  selectedIds,
  selectedNames,
  onSuccess,
}: BulkSizeChartModalProps) {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([])
  const [loadingCharts, setLoadingCharts] = useState(false)
  const [selectedSizeChartId, setSelectedSizeChartId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setError('')
      setSuccessMsg('')
      setLoadingCharts(true)
      fetch('/api/admin/size-charts')
        .then(res => res.json())
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setSizeCharts(res.data)
            if (res.data.length > 0) {
              setSelectedSizeChartId(res.data[0].id)
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingCharts(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedSc = sizeCharts.find(sc => sc.id === selectedSizeChartId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) return

    setSubmitting(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/products/bulk-size-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: selectedIds,
          size_chart_id: selectedSizeChartId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah size chart produk')

      setSuccessMsg(`Berhasil memasang Size Chart ke ${data.count} produk terpilih!`)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui size chart produk')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-gray-900">Edit Size Chart Masal</h2>
              <p className="text-xs text-gray-500">Pasang template chart ukuran sekaligus ke beberapa produk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Info selected products count */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
              {selectedIds.length}
            </div>
            <div className="space-y-1">
              <p className="font-bold text-emerald-900">
                Memasang Size Chart untuk {selectedIds.length} Produk Terpilih:
              </p>
              <p className="text-emerald-800 text-[11px] line-clamp-2">
                {selectedNames.join(', ')}
              </p>
            </div>
          </div>

          {/* Template Selector Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 font-display">
              Pilih Master Size Chart:
            </label>
            {loadingCharts ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                Memuat template size chart...
              </div>
            ) : (
              <select
                value={selectedSizeChartId}
                onChange={e => setSelectedSizeChartId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
              >
                <option value="">-- Tanpa Size Chart (Hapus dari produk) --</option>
                {sizeCharts.map(sc => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.category || 'Umum'}) - [{sc.sizes?.join(', ')}]
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Live Preview Table */}
          {selectedSc && selectedSc.sizes && selectedSc.sizes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-700 font-display">
                Pratinjau Tabel yang akan Dipasang:
              </span>
              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="font-display font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-emerald-700" />
                    {selectedSc.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                    Satuan: {selectedSc.unit || 'cm'}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-800 text-white font-display font-bold text-[11px] uppercase">
                        <th className="py-2.5 px-3 font-bold border-b border-emerald-900">Keterangan</th>
                        {selectedSc.sizes.map(s => (
                          <th key={s} className="py-2.5 px-2 text-center font-bold border-b border-emerald-900">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedSc.measurements || []).map((m, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                          <td className="py-2.5 px-3 font-display font-semibold text-gray-800 text-xs whitespace-nowrap">
                            {m.label}
                          </td>
                          {selectedSc.sizes.map(s => (
                            <td key={s} className="py-2.5 px-2 text-center font-medium text-gray-700 text-xs sm:text-sm">
                              {m.values[s] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ruler className="w-4 h-4" />}
              {submitting ? 'Menerapkan...' : `Terapkan ke ${selectedIds.length} Produk`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
