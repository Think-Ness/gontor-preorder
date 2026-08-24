'use client'

import { useState, useEffect, useRef } from 'react'
import { KeyRound, ShieldCheck, Loader2, ArrowRight, Lock, ShieldAlert, Clock } from 'lucide-react'

interface Props {
  role: 'vendor' | 'stand' | 'delivery'
  title: string
  onSuccess: (pin: string) => void
}

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 180 // 3 Menit Cooldown

export default function DisplayPinModal({ role, title, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockRemaining, setLockRemaining] = useState<number>(0)

  const inputRef = useRef<HTMLInputElement>(null)

  const attemptsKey = `display_pin_attempts_${role}`
  const lockKey = `display_pin_lock_${role}`

  // Synchronize lock state & attempts from localStorage
  useEffect(() => {
    const syncLockState = () => {
      if (typeof window === 'undefined') return
      const lockUntilStr = localStorage.getItem(lockKey)
      if (lockUntilStr) {
        const lockUntil = parseInt(lockUntilStr, 10)
        const now = Date.now()
        if (lockUntil > now) {
          const seconds = Math.ceil((lockUntil - now) / 1000)
          setLockRemaining(seconds)
          return
        } else {
          // Lock expired, reset
          localStorage.removeItem(lockKey)
          localStorage.removeItem(attemptsKey)
          setLockRemaining(0)
          setAttempts(0)
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      } else {
        const storedAttempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10)
        setAttempts(storedAttempts)
        setLockRemaining(0)
      }
    }

    syncLockState()

    const interval = setInterval(() => {
      const lockUntilStr = localStorage.getItem(lockKey)
      if (lockUntilStr) {
        const lockUntil = parseInt(lockUntilStr, 10)
        const now = Date.now()
        if (lockUntil > now) {
          setLockRemaining(Math.ceil((lockUntil - now) / 1000))
        } else {
          localStorage.removeItem(lockKey)
          localStorage.removeItem(attemptsKey)
          setLockRemaining(0)
          setAttempts(0)
          setTimeout(() => inputRef.current?.focus(), 50)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [role, attemptsKey, lockKey])

  const formatLockTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins > 0 ? `${mins}m ` : ''}${secs < 10 && mins > 0 ? '0' : ''}${secs}s`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockRemaining > 0 || !pin.trim()) return

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
        // Reset attempts on success
        localStorage.removeItem(attemptsKey)
        localStorage.removeItem(lockKey)
        sessionStorage.setItem(`display_pin_${role}`, pin)
        onSuccess(pin)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        localStorage.setItem(attemptsKey, newAttempts.toString())

        // Clear input PIN & refocus back to textbox
        setPin('')
        setTimeout(() => {
          inputRef.current?.focus()
        }, 50)

        if (newAttempts >= MAX_ATTEMPTS) {
          const lockUntil = Date.now() + LOCKOUT_SECONDS * 1000
          localStorage.setItem(lockKey, lockUntil.toString())
          setLockRemaining(LOCKOUT_SECONDS)
          setError(`Akses ditangguhkan! Terlalu banyak percobaan PIN yang salah.`)
        } else {
          setError(data.error || 'PIN Keamanan Salah!')
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan. Coba lagi.')
      setPin('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    } finally {
      setLoading(false)
    }
  }

  const isLocked = lockRemaining > 0

  return (
    <div className="fixed inset-0 z-50 bg-[#f8faf9]/95 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Ambient Glow Background Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-radial from-emerald-100/60 via-amber-50/40 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-[26rem] bg-white rounded-[2.2rem] p-7 sm:p-9 shadow-[0_24px_60px_-15px_rgba(6,61,46,0.14)] border border-emerald-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Luxury Top Icon Badge */}
        <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 mx-auto ${
          isLocked
            ? 'bg-gradient-to-br from-rose-900 to-rose-950 shadow-lg shadow-rose-950/20 border border-rose-700/40'
            : 'bg-gradient-to-br from-[#063D2E] to-[#0a523e] shadow-lg shadow-emerald-950/20 border border-emerald-700/40'
        }`}>
          {isLocked ? (
            <ShieldAlert className="w-8 h-8 text-rose-400 animate-pulse" />
          ) : (
            <KeyRound className="w-8 h-8 text-[#D4AF37]" />
          )}
        </div>

        {/* Section Titles */}
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold font-display uppercase tracking-widest ${
            isLocked
              ? 'bg-rose-50 border border-rose-200/80 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200/60 text-[#063D2E]'
          }`}>
            {isLocked ? <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
            {isLocked ? 'Akses Ditangguhkan' : 'Layar Monitor Realtime'}
          </div>
          <h2 className="font-display font-black text-2xl text-gray-950 leading-tight tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-gray-500 font-body leading-relaxed max-w-xs mx-auto">
            {isLocked
              ? 'Terlalu banyak percobaan PIN yang salah. Harap tunggu hingga timer selesai untuk mencoba lagi.'
              : 'Masukkan PIN untuk mengontrol dan mengakses layar monitor realtime 100 Tahun Gontor.'}
          </p>
        </div>

        {/* Form Input Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLocked ? (
            /* Lockout Card */
            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2 text-center animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-2 text-rose-800 font-bold text-xs">
                <Clock className="w-4 h-4 animate-spin text-rose-600" />
                <span>Cobalah kembali dalam:</span>
              </div>
              <div className="font-mono font-black text-3xl text-rose-700 tracking-wider">
                {formatLockTime(lockRemaining)}
              </div>
              <p className="text-[11px] text-rose-600/90 font-medium">
                Gagal memasukkan PIN berulang kali. Sistem memblokir percobaan PIN sementara demi keamanan.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Masukkan PIN"
                  disabled={loading}
                  autoFocus
                  className="w-full text-center tracking-[0.3em] font-mono text-xl sm:text-2xl font-bold py-3.5 pl-10 pr-4 rounded-2xl bg-gray-50/80 border border-gray-200 text-gray-900 placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal focus:bg-white focus:border-[#063D2E] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {error && !isLocked && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Premium Competzy Pill Button */}
          <button
            type="submit"
            disabled={loading || !pin.trim() || isLocked}
            className={`w-full py-4 rounded-2xl font-display font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 ${
              isLocked
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-[#063D2E] via-emerald-900 to-[#063D2E] hover:from-[#0a523e] hover:to-[#0d644d] text-white shadow-emerald-950/20 hover:shadow-emerald-950/30'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLocked ? (
              <ShieldAlert className="w-5 h-5 text-gray-400" />
            ) : (
              <ArrowRight className="w-5 h-5 text-[#D4AF37]" />
            )}
            <span>
              {loading ? 'Verifikasi PIN...' : isLocked ? 'Akses Terbanned Sementara' : 'Buka Layar Monitor'}
            </span>
          </button>
        </form>

        <div className="pt-2 text-[11px] text-gray-400 font-body border-t border-gray-100">
          Panitia Peringatan 100 Tahun Gontor
        </div>
      </div>
    </div>
  )
}
