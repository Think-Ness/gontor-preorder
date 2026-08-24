'use client'

import { useState, useEffect } from 'react'
import { SizeChart } from '@/types'
import { Plus, Ruler, Edit, Trash2, Loader2, Sparkles, Check } from 'lucide-react'
import SizeChartEditorModal from '@/components/admin/SizeChartEditorModal'

export default function AdminSizeChartsPage() {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChart, setEditingChart] = useState<SizeChart | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSizeCharts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/size-charts')
      const data = await res.json()
      if (data.data) {
        setSizeCharts(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSizeCharts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template Size Chart ini? Produk yang menggunakan template ini akan terlepas dari size chart ini.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/size-charts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSizeCharts(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpenCreate = () => {
    setEditingChart(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (chart: SizeChart) => {
    setEditingChart(chart)
    setIsModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
              <Ruler className="w-5 h-5" />
            </div>
            <h1 className="font-display font-black text-xl sm:text-2xl text-gray-900">
              Master Size Chart (Panduan Ukuran)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola template tabel panduan ukuran yang dapat dipasangkan secara masal ke berbagai produk preorder.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary px-5 py-2.5 text-xs sm:text-sm font-display font-bold inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Template Size Chart Baru</span>
        </button>
      </div>

      {/* Grid of Size Charts */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-xs font-semibold">Memuat daftar Master Size Chart...</p>
        </div>
      ) : sizeCharts.length === 0 ? (
        <div className="p-12 text-center bg-amber-50/50 rounded-3xl border border-amber-200/80 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
            <Ruler className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-gray-900 text-base">Belum Ada Template Size Chart</h3>
            <p className="text-xs text-gray-500">
              Buat template size chart pertama seperti Kaos Lengan Pendek, Kaos Lengan Panjang, atau Jaket Bomber.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn-primary px-5 py-2 text-xs font-display font-bold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Template Size Chart
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sizeCharts.map(sc => (
            <div
              key={sc.id}
              className="card-premium p-5 flex flex-col justify-between hover:shadow-xl transition-all border border-gray-200 bg-white group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                      {sc.category || 'Pakaian'}
                    </span>
                    <h3 className="font-display font-black text-base text-gray-900 mt-1 line-clamp-1">
                      {sc.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sc)}
                      className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Size Chart"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sc.id)}
                      disabled={deletingId === sc.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Size Chart"
                    >
                      {deletingId === sc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-slate-50 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-display font-black text-gray-600 uppercase border-b border-gray-200 pb-1.5">
                    <span>Keterangan</span>
                    <div className="flex gap-1.5">
                      {(sc.sizes || []).map(s => (
                        <span key={s} className="w-7 text-center">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {(sc.measurements || []).map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-gray-800 text-[10px] truncate max-w-[110px]">
                          {m.label}
                        </span>
                        <div className="flex gap-1.5">
                          {(sc.sizes || []).map(s => (
                            <span key={s} className="w-7 py-0.5 text-center bg-white text-gray-900 font-bold rounded border border-gray-200 text-[10px]">
                              {m.values[s] || '-'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium mt-4">
                <span>Satuan: {sc.unit || 'cm'}</span>
                <button
                  onClick={() => handleOpenEdit(sc)}
                  className="text-emerald-700 font-display font-bold hover:underline"
                >
                  Edit Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SizeChartEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chartToEdit={editingChart}
        onSaved={fetchSizeCharts}
      />
    </div>
  )
}
