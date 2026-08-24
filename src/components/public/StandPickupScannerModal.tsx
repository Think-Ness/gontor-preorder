'use client'

import { useState, useRef, useEffect } from 'react'
import { QrCode, Search, X, CheckCircle2, AlertTriangle, XCircle, Package, ArrowRight, RefreshCw, Check, Camera, CameraOff, Video, Truck, Clock, Info, Sparkles } from 'lucide-react'
import { broadcastOrderUpdate } from '@/lib/realtime'

interface StandPickupScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccessRefresh: () => void
}

export default function StandPickupScannerModal({ isOpen, onClose, onSuccessRefresh }: StandPickupScannerModalProps) {
  const [query, setQuery] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [handingOver, setHandingOver] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResult(null)
      setError(null)
      setIsCameraActive(false)
      setCameraError(null)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Fetch available camera devices
  const loadCameraDevices = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length > 0) {
        setCameras(devices)
        if (!selectedCameraId) {
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment') || d.label.toLowerCase().includes('belakang'))
          setSelectedCameraId(backCam ? backCam.id : devices[0].id)
        }
      }
    } catch (err) {
      console.warn('Could not enumerate cameras:', err)
    }
  }

  const toggleCamera = async () => {
    if (isCameraActive) {
      setIsCameraActive(false)
    } else {
      setCameraError(null)
      await loadCameraDevices()
      setIsCameraActive(true)
    }
  }

  // Live Camera Scanner Initialization
  useEffect(() => {
    if (!isCameraActive) return
    let html5QrCode: any = null
    let isStopped = false

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (isStopped) return
      html5QrCode = new Html5Qrcode('qr-camera-scanner-view')

      const cameraConfig = selectedCameraId
        ? selectedCameraId
        : { facingMode: 'environment' }

      html5QrCode.start(
        cameraConfig,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText: string) => {
          if (isStopped) return
          isStopped = true
          html5QrCode.stop().then(() => {
            setIsCameraActive(false)
            handleVerify(decodedText)
          }).catch(() => {
            setIsCameraActive(false)
            handleVerify(decodedText)
          })
        },
        () => {}
      ).catch((err: any) => {
        console.error('Camera start error:', err)
        setCameraError('Gagal membuka kamera. Pastikan izin akses kamera diizinkan di browser.')
      })
    }).catch(() => {
      setCameraError('Gagal memuat modul kamera scanner.')
    })

    return () => {
      isStopped = true
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {})
      }
    }
  }, [isCameraActive, selectedCameraId])

  if (!isOpen) return null

  const handleVerify = async (queryToSubmit?: string) => {
    const searchVal = queryToSubmit || query
    if (!searchVal.trim()) return

    setVerifying(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/display/pickup-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchVal.trim(), action: 'verify' }),
      })
      const json = await res.json()

      if (!json.success && json.status === 'NOT_FOUND') {
        setError(json.error || 'Pesanan tidak ditemukan.')
        setResult(null)
      } else {
        setResult(json)
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat memverifikasi.')
    } finally {
      setVerifying(false)
    }
  }

  const handleHandover = async () => {
    if (!result?.order?.order_number) return

    setHandingOver(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/display/pickup-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: result.order.order_number, action: 'handover' }),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || 'Gagal menyerahkan barang.')
      } else {
        setResult({ ...result, status: 'SUCCESS', message: json.message, order: json.order })
        broadcastOrderUpdate()
        onSuccessRefresh()
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memproses penyerahan barang.')
    } finally {
      setHandingOver(false)
    }
  }

  const handleMarkReady = async () => {
    if (!result?.order?.order_number) return

    setHandingOver(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/display/pickup-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: result.order.order_number, action: 'mark_ready' }),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || 'Gagal mengubah status.')
      } else {
        setResult({ ...result, status: 'READY_FOR_PICKUP', message: json.message, order: json.order })
        broadcastOrderUpdate()
        onSuccessRefresh()
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui status.')
    } finally {
      setHandingOver(false)
    }
  }

  const items = Array.isArray(result?.order?.order_items) && result.order.order_items.length > 0
    ? result.order.order_items
    : (Array.isArray(result?.order?.items) && result.order.items.length > 0 ? result.order.items : [])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-[#063D2E] to-emerald-900 text-white shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-bold font-display uppercase tracking-widest mb-0.5 border border-amber-400/20">
                <Sparkles className="w-3 h-3" /> Verifikasi Stand Bazar
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                Scan QR Tiket & Verifikasi Order
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input & Camera Toggle */}
        <div className="p-5 sm:p-6 bg-gray-50/90 border-b border-gray-200/80 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleVerify()
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Scan QR / Ketik Nomor Order (MCH-2026-XXXXX) / Stambuk..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-200 text-sm font-mono font-bold text-gray-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || !query.trim()}
              className="px-6 py-3.5 rounded-2xl bg-[#063D2E] hover:bg-[#0a523e] active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 text-amber-300" />}
              <span>Cek Tiket</span>
            </button>
          </form>

          {/* Camera Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={toggleCamera}
              className={`px-5 py-2.5 rounded-2xl font-display font-bold text-xs flex items-center gap-2.5 border transition-all cursor-pointer ${
                isCameraActive
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-sm'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/90 shadow-2xs'
              }`}
            >
              {isCameraActive ? <CameraOff className="w-4 h-4 text-red-600" /> : <Camera className="w-4 h-4 text-emerald-700" />}
              <span>{isCameraActive ? 'Tutup Kamera Scanner' : 'Buka Kamera untuk Scan QR'}</span>
            </button>

            {cameras.length > 1 && isCameraActive && (
              <div className="flex items-center gap-2 text-xs text-gray-700 bg-white px-3.5 py-2 rounded-2xl border border-gray-200 shadow-2xs">
                <Video className="w-4 h-4 text-emerald-700 shrink-0" />
                <select
                  value={selectedCameraId || ''}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  {cameras.map((cam, idx) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera Lensa ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Live Camera Scanner Area */}
        {isCameraActive && (
          <div className="p-5 bg-gray-950 flex flex-col items-center justify-center gap-3 border-b border-gray-800">
            <div id="qr-camera-scanner-view" className="w-full max-w-[300px] h-[300px] rounded-2xl overflow-hidden bg-black shadow-inner border-2 border-emerald-500" />
            <p className="text-xs text-amber-400 font-display font-bold animate-pulse">
              Arahkan kamera ke QR Code Tiket Pengambilan...
            </p>
            {cameraError && (
              <p className="text-xs text-red-400 font-semibold bg-red-950/90 p-3 rounded-xl border border-red-800/80 max-w-md text-center">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* Verification Result Area */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[500px] overflow-y-auto">
          
          {error && !result && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3.5">
              <XCircle className="w-7 h-7 text-red-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-red-900">Pesanan Tidak Ditemukan</p>
                <p className="mt-0.5 leading-relaxed text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && result.order && (
            <div className="space-y-5">
              
              {/* DYNAMIC STATUS BANNERS */}
              {result.status === 'SUCCESS' ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-100 border-2 border-emerald-500 text-emerald-950 flex items-center gap-4 shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-black text-base uppercase tracking-tight text-emerald-950">BARANG BERHASIL DISERAHKAN!</p>
                    <p className="text-xs font-medium text-emerald-800 mt-0.5">{result.message}</p>
                  </div>
                </div>
              ) : result.status === 'READY_FOR_PICKUP' || result.status === 'VALID' ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-950 flex items-center gap-4 shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-black text-base uppercase tracking-tight text-emerald-950">✨ TIKET VALID & SIAP DIAMBIL DI STAND</p>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                      Pembayaran terverifikasi LUNAS dan fisik merchandise sudah SIAP DIAMBIL di stand. Silakan serahkan barang.
                    </p>
                  </div>
                </div>
              ) : result.status === 'PROCESSING' ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border-2 border-blue-400 text-blue-950 flex items-center gap-4 shadow-sm">
                  <RefreshCw className="w-8 h-8 text-blue-600 shrink-0 animate-spin" />
                  <div>
                    <p className="font-black text-base uppercase tracking-tight text-blue-950">📦 PEMBAYARAN LUNAS (SEDANG DIPROSES PANITIA)</p>
                    <p className="text-xs font-semibold text-blue-800 mt-0.5">
                      Pembayaran terverifikasi LUNAS. Namun status pesanan saat ini masih dalam tahap penyiapan panitia (PROCESSING).
                    </p>
                  </div>
                </div>
              ) : result.status === 'ALREADY_COMPLETED' ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-500 text-red-950 flex items-center gap-4 shadow-sm">
                  <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                  <div>
                    <p className="font-black text-base uppercase tracking-tight text-red-950">⚠️ BARANG SUDAH PERNAH DIAMBIL</p>
                    <p className="text-xs font-semibold text-red-800 mt-0.5">
                      Tiket order ini telah diserahterimakan sebelumnya kepada petugas stand.
                    </p>
                  </div>
                </div>
              ) : result.status === 'DELIVERY_METHOD' ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50 border-2 border-purple-400 text-purple-950 flex items-center gap-4 shadow-sm">
                  <Truck className="w-8 h-8 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-black text-base uppercase tracking-tight text-purple-950">🚚 PESANAN DIKIRIM KE ALAMAT (EKSPEDISI)</p>
                    <p className="text-xs font-semibold text-purple-800 mt-0.5">
                      Pesanan ini terdaftar opsi Pengiriman Ekspedisi ke Alamat, bukan diambil di stand.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-500 text-amber-950 flex items-center gap-4 shadow-sm">
                  <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-black text-base uppercase tracking-tight text-amber-950">⛔ PEMBAYARAN BELUM TERVERIFIKASI LUNAS</p>
                    <p className="text-xs font-semibold text-amber-800 mt-0.5">
                      Pesanan belum dinyatakan LUNAS oleh panitia keuangan (Status: {result.order.payment_status}).
                    </p>
                  </div>
                </div>
              )}

              {/* Order Info Card */}
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">No. Order</span>
                    <span className="font-mono font-bold text-base text-gray-900 block mt-0.5">{result.order.order_number}</span>
                    <span className="text-gray-500 text-[11px] block mt-0.5">Status: <strong className="text-emerald-800">{result.order.order_status}</strong></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pemesan</span>
                    <span className="font-bold text-sm text-gray-900 block mt-0.5">{result.order.full_name}</span>
                    <span className="text-[11px] text-gray-500 block">Stambuk: {result.order.stambuk || '-'} • WA: {result.order.whatsapp}</span>
                  </div>
                </div>

                {/* Items Checklist */}
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-2 font-display">
                    Rincian Barang Kit yang Harus Diserahkan:
                  </span>
                  <div className="bg-white rounded-2xl p-3.5 border border-gray-200 space-y-2">
                    {items.map((it: any, i: number) => {
                      const qty = it.quantity || 1
                      const name = it.item_name_snapshot || it.product_name || 'Merchandise'
                      const variant = it.variant_name_snapshot || it.variant_name ? ` (${it.variant_name_snapshot || it.variant_name})` : ''
                      return (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-900 border-b border-gray-100 last:border-none pb-1.5 last:pb-0">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                            {qty}x
                          </span>
                          <span className="leading-snug">{name}{variant}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {result.status === 'PROCESSING' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={handleMarkReady}
                    disabled={handingOver}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {handingOver ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Clock className="w-4 h-4" />}
                    <span>Tandai Siap Diambil</span>
                  </button>

                  <button
                    onClick={handleHandover}
                    disabled={handingOver}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {handingOver ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Check className="w-4 h-4 text-amber-300" />}
                    <span>Tetap Serahkan Barang</span>
                  </button>
                </div>
              )}

              {(result.status === 'READY_FOR_PICKUP' || result.status === 'VALID') && (
                <button
                  onClick={handleHandover}
                  disabled={handingOver}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-display font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-98 cursor-pointer"
                >
                  {handingOver ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  ) : (
                    <Check className="w-6 h-6 text-amber-400" />
                  )}
                  <span>SERAHKAN BARANG & SELESAIKAN ORDER</span>
                </button>
              )}

            </div>
          )}

          {!result && !error && !verifying && !isCameraActive && (
            <div className="py-12 text-center text-gray-400 text-xs space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                <QrCode className="w-7 h-7" />
              </div>
              <p className="font-bold text-gray-600 text-sm">Buka Kamera atau Ketik Nomor Order</p>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                Sistem akan memverifikasi keabsahan tiket, status lunas, dan status penyiapan fisik barang secara instant.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs">
          <span className="text-gray-500 font-display">Stand Bazar 100 Tahun Gontor</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold font-display cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}
