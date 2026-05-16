'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#f97316' }}>
            <span className="text-white font-black text-sm">A</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AtomQuest</span>
        </div>

        <div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
            Hackathon 1.0 · 2025
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-4">
            Goal Setting<br />
            <span style={{ color: '#f97316' }}>& Tracking</span><br />
            Portal
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Set, track and achieve your quarterly goals with complete transparency across all levels.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Employees', value: '3 Roles' },
            { label: 'UoM Types', value: '4 Types' },
            { label: 'Quarters', value: 'Q1–Q4' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6"
        style={{ background: '#0a0a0a' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#f97316' }}>
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="text-white font-bold text-lg">AtomQuest</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your portal account</p>

          {error && (
            <div className="rounded-xl p-4 mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email address</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 mb-6"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          {/* Role switcher */}
          <div className="rounded-2xl p-4"
            style={{ background: '#111', border: '1px solid #1f1f1f' }}>
            <p className="text-xs text-gray-600 mb-3 font-medium uppercase tracking-wider">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '👤 Employee', email: 'employee@demo.com' },
                { label: '🧑‍💼 Manager', email: 'manager@demo.com' },
                { label: '⚙️ Admin', email: 'admin@demo.com' },
              ].map(role => (
                <button key={role.email}
                  onClick={() => { setEmail(role.email); setPassword('Demo@1234') }}
                  className="py-2 px-2 rounded-lg text-xs font-medium transition-all text-center"
                  style={{ background: '#1a1a1a', color: '#9ca3af', border: '1px solid #2a2a2a' }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.borderColor = '#f97316'
                    ;(e.target as HTMLElement).style.color = '#f97316'
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.borderColor = '#2a2a2a'
                    ;(e.target as HTMLElement).style.color = '#9ca3af'
                  }}>
                  {role.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-700 text-center mt-2">Password: Demo@1234</p>
          </div>
        </div>
      </div>
    </div>
  )
}