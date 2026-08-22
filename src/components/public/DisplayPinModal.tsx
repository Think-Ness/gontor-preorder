'use client'

import { useState } from 'react'
import { KeyRound, ShieldCheck, Loader2, ArrowRight, Lock } from 'lucide-react'

interface Props {
  role: 'vendor' | 'stand' | 'delivery'
  title: string
  onSuccess: (pin: string) => void
}

export default function DisplayPinModal({ role, title, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/display/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, pin }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        sessionStorage.setItem(`display_pin_${role}`, pin)
        onSuccess(pin)
      } else {
        setError(data.error || 'PIN Keamanan Salah!')
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f8faf9]/95 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Ambient Glow Background Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-radial from-emerald-100/60 via-amber-50/40 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-[26rem] bg-white rounded-[2.2rem] p-7 sm:p-9 shadow-[0_24px_60px_-15px_rgba(6,61,46,0.14)] border border-emerald-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Luxury Top Icon Badge */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#063D2E] to-[#0a523e] shadow-lg shadow-emerald-950/20 border border-emerald-700/40 mx-auto">
          <KeyRound className="w-8 h-8 text-[#D4AF37]" />
        </div>

        {/* Section Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[#063D2E] text-[11px] font-extrabold font-display uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Layar Monitor Realtime
          </div>
          <h2 className="font-display font-black text-2xl text-gray-950 leading-tight tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-gray-500 font-body leading-relaxed max-w-xs mx-auto">
            Masukkan PIN untuk mengontrol dan mengakses layar monitor realtime 100 Tahun Gontor.
          </p>
        </div>

        {/* Form Input Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Masukkan PIN"
                autoFocus
                className="w-full text-center tracking-[0.3em] font-mono text-xl sm:text-2xl font-bold py-3.5 pl-10 pr-4 rounded-2xl bg-gray-50/80 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal focus:bg-white focus:border-[#063D2E] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>
            <div className="text-[11px] text-gray-400 font-body text-center">
              Default PIN: <span className="font-mono font-bold text-gray-600">1234</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Premium Competzy Pill Button */}
          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#063D2E] via-emerald-900 to-[#063D2E] hover:from-[#0a523e] hover:to-[#0d644d] text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/20 hover:shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 text-[#D4AF37]" />}
            <span>{loading ? 'Verifikasi PIN...' : 'Buka Layar Monitor'}</span>
          </button>
        </form>

        <div className="pt-2 text-[11px] text-gray-400 font-body border-t border-gray-100">
          Panitia Peringatan 100 Tahun Gontor
        </div>
      </div>
    </div>
  )
}
