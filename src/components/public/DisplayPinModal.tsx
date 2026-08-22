'use client'

import { useState } from 'react'
import { KeyRound, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 bg-[#f8faf9]/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(6,61,46,0.15)] border border-emerald-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#063D2E] mx-auto shadow-sm">
          <KeyRound className="w-8 h-8 text-[#D4AF37]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-[#063D2E] text-[11px] font-bold font-display uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Layar Monitor Realtime
          </div>
          <h2 className="font-display font-black text-2xl text-gray-900 leading-tight">
            {title}
          </h2>
          <p className="text-xs text-gray-500 font-body leading-relaxed">
            Masukkan PIN Keamanan untuk membuka layar monitor realtime 100 Tahun Gontor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Masukkan PIN (Default: 1234)"
              autoFocus
              className="w-full text-center tracking-widest text-2xl font-mono py-3.5 px-4 rounded-2xl border-2 border-emerald-200 focus:border-[#063D2E] focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="btn-primary w-full py-4 rounded-2xl text-sm font-display font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {loading ? 'Verifikasi PIN...' : 'Buka Layar Monitor'}
          </button>
        </form>

        <div className="pt-2 text-[11px] text-gray-400 font-body border-t border-gray-100">
          Panitia Peringatan 100 Tahun Gontor
        </div>
      </div>
    </div>
  )
}
