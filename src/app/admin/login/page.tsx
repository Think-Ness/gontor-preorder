'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      setError('Email atau kata sandi yang Anda masukkan salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#F8FAFC]">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-green-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-green-700 to-green-950 shadow-2xl shadow-green-900/20 mb-6 relative group cursor-pointer transform transition-transform duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-[1.5rem] transition-opacity duration-300" />
              <ShieldCheck className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <h1 className="font-display font-black text-gray-900 text-3xl mb-2 tracking-tight">Admin Portal</h1>
            <p className="text-gray-500 font-medium text-sm">Sistem Manajemen Pre-Order</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-5 py-4 rounded-2xl mb-8 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="mt-0.5 text-red-500"><Lock className="w-4 h-4" /></div>
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 font-display ml-1">Alamat Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors duration-300">
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@gontor.ac.id"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all duration-300 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 font-display ml-1">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors duration-300">
                  <Lock className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all duration-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors duration-200 outline-none focus:text-green-600"
                >
                  {showPass ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-gradient-to-br from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-[0_8px_20px_rgb(21,128,61,0.25)] hover:shadow-[0_12px_25px_rgb(21,128,61,0.35)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-8 font-display tracking-wide overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  OTORISASI MASUK
                </span>
              )}
            </button>
          </form>
          
          {/* Footer note */}
          <div className="mt-10 text-center text-xs font-medium text-gray-400">
            &copy; {new Date().getFullYear()} Panitia 100 Tahun Gontor.<br/>Sistem terenkripsi penuh.
          </div>
        </div>
      </div>
    </div>
  )
}
