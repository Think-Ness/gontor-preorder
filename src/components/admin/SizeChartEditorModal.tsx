'use client'

import { useState, useEffect } from 'react'
import { SizeChart, SizeChartMeasurement } from '@/types'
import { X, Plus, Trash2, Save, Loader2, Ruler } from 'lucide-react'

interface SizeChartEditorModalProps {
  isOpen: boolean
  onClose: () => void
  chartToEdit?: SizeChart | null
  onSaved: (chart: SizeChart) => void
}

export default function SizeChartEditorModal({
  isOpen,
  onClose,
  chartToEdit,
  onSaved,
}: SizeChartEditorModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Pakaian')
  const [unit, setUnit] = useState('cm')
  const [sizes, setSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
  const [measurements, setMeasurements] = useState<SizeChartMeasurement[]>([
    { label: 'Panjang Lengan', values: { XS: '52', S: '52.5', M: '54', L: '55.5', XL: '59', XXL: '61' } },
    { label: 'Tinggi Badan', values: { XS: '64', S: '66', M: '68.5', L: '70', XL: '74', XXL: '76' } },
    { label: 'Lebar Badan', values: { XS: '41.5', S: '45.5', M: '49.5', L: '52.5', XL: '57.5', XXL: '61.5' } },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newSizeInput, setNewSizeInput] = useState('')

  useEffect(() => {
    if (chartToEdit) {
      setName(chartToEdit.name || '')
      setCategory(chartToEdit.category || 'Pakaian')
      setUnit(chartToEdit.unit || 'cm')
      setSizes(chartToEdit.sizes || ['S', 'M', 'L', 'XL'])
      setMeasurements(chartToEdit.measurements || [])
    } else {
      setName('')
      setCategory('Pakaian')
      setUnit('cm')
      setSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
      setMeasurements([
        { label: 'Panjang Lengan', values: { XS: '52', S: '52.5', M: '54', L: '55.5', XL: '59', XXL: '61' } },
        { label: 'Tinggi Badan', values: { XS: '64', S: '66', M: '68.5', L: '70', XL: '74', XXL: '76' } },
        { label: 'Lebar Badan', values: { XS: '41.5', S: '45.5', M: '49.5', L: '52.5', XL: '57.5', XXL: '61.5' } },
      ])
    }
    setError('')
  }, [chartToEdit, isOpen])

  if (!isOpen) return null

  const handleAddSize = () => {
    if (!newSizeInput.trim()) return
    const s = newSizeInput.trim().toUpperCase()
    if (sizes.includes(s)) return
    setSizes(prev => [...prev, s])
    setNewSizeInput('')
  }

  const handleRemoveSize = (sizeToRemove: string) => {
    if (sizes.length <= 1) return
    setSizes(prev => prev.filter(s => s !== sizeToRemove))
    setMeasurements(prev =>
      prev.map(m => {
        const nextVals = { ...m.values }
        delete nextVals[sizeToRemove]
        return { ...m, values: nextVals }
      })
    )
  }

  const handleAddMeasurementRow = () => {
    setMeasurements(prev => [
      ...prev,
      { label: 'Keterangan Baru', values: {} },
    ])
  }

  const handleRemoveMeasurementRow = (idx: number) => {
    setMeasurements(prev => prev.filter((_, i) => i !== idx))
  }

  const handleMeasurementLabelChange = (idx: number, newLabel: string) => {
    setMeasurements(prev =>
      prev.map((m, i) => (i === idx ? { ...m, label: newLabel } : m))
    )
  }

  const handleValueChange = (idx: number, size: string, val: string) => {
    setMeasurements(prev =>
      prev.map((m, i) => {
        if (i !== idx) return m
        return {
          ...m,
          values: {
            ...m.values,
            [size]: val,
          },
        }
      })
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama Size Chart wajib diisi')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        name: name.trim(),
        category,
        unit,
        sizes,
        measurements,
      }

      const url = chartToEdit ? `/api/admin/size-charts/${chartToEdit.id}` : '/api/admin/size-charts'
      const method = chartToEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal menyimpan size chart')
      }

      onSaved(data.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-base sm:text-lg">
              {chartToEdit ? 'Edit Template Size Chart' : 'Buat Template Size Chart Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1 font-display">
                Nama Template Size Chart *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Size Chart Kaos Lengan Pendek"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 font-display">
                Satuan Ukuran
              </label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="cm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Size Columns Manager */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 font-display">
                Daftar Ukuran / Size (Kolom Header)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSizeInput}
                  onChange={e => setNewSizeInput(e.target.value)}
                  placeholder="+ Tambah Ukuran (ex: 3XL)"
                  className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 bg-white"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <div
                  key={size}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/80 border border-amber-300 text-amber-900 rounded-xl text-xs font-display font-black"
                >
                  <span>{size}</span>
                  {sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="text-amber-700 hover:text-red-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Grid Measurement Editor (Matching user's screenshot layout!) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 font-display">
                Matriks Tabel Ukuran (Panjang Lengan, Lebar Badan, Tinggi Badan, dll)
              </label>
              <button
                type="button"
                onClick={handleAddMeasurementRow}
                className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-display font-bold flex items-center gap-1 hover:bg-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" /> Baris Keterangan Baru
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-display font-bold uppercase text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 min-w-[180px]">Keterangan</th>
                    {sizes.map(size => (
                      <th key={size} className="px-3 py-3 text-center min-w-[70px]">
                        {size}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center w-10">#</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {measurements.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-2">
                        <input
                          type="text"
                          value={m.label}
                          onChange={e => handleMeasurementLabelChange(idx, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/50 text-amber-950 font-display font-bold text-xs"
                          placeholder="misal: PANJANG LENGAN"
                        />
                      </td>
                      {sizes.map(size => (
                        <td key={size} className="p-2 text-center">
                          <input
                            type="text"
                            value={m.values[size] || ''}
                            onChange={e => handleValueChange(idx, size, e.target.value)}
                            className="w-full px-2 py-1.5 text-center rounded-lg border border-gray-200 font-semibold text-gray-800 focus:ring-1 focus:ring-emerald-500"
                            placeholder="-"
                          />
                        </td>
                      ))}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasurementRow(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-inner">
            <div className="text-xs font-display font-bold text-amber-400 uppercase tracking-wider">
              Live Preview Tampilan di User Pembeli:
            </div>

            <div className="bg-slate-950 p-4 rounded-xl space-y-3 overflow-x-auto border border-slate-800">
              <div className="text-center font-display font-black text-amber-400 text-sm tracking-widest uppercase">
                {name || 'TITEL SIZE CHART'}
              </div>

              <div className="flex items-center justify-between text-[11px] font-display font-black text-amber-300 border-b border-slate-800 pb-2">
                <span className="w-36">KETERANGAN</span>
                <div className="flex gap-2">
                  {sizes.map(s => (
                    <span key={s} className="w-12 text-center">{s}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {measurements.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="w-36 px-3 py-1.5 bg-amber-500/20 text-amber-300 font-display font-black rounded-xl border border-amber-500/30 text-[11px]">
                      {m.label.toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      {sizes.map(s => (
                        <span
                          key={s}
                          className="w-12 py-1.5 text-center bg-amber-500/10 text-amber-100 font-bold rounded-xl border border-amber-500/20 text-[11px]"
                        >
                          {m.values[s] || '-'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-400 italic text-right pt-1">
                * Satuan ukuran dalam {unit}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-2.5 text-xs font-display font-bold flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Template Size Chart'}
          </button>
        </div>
      </div>
    </div>
  )
}
