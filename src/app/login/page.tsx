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
    <>
      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(60px, -80px) scale(1.15); }
          66% { transform: translate(-40px, 60px) scale(0.9); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-70px, 50px) scale(1.2); }
          66% { transform: translate(50px, -60px) scale(0.85); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, 70px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(300%) rotate(45deg); }
        }
        .orb1 { animation: orb1 8s ease-in-out infinite; }
        .orb2 { animation: orb2 10s ease-in-out infinite; }
        .orb3 { animation: orb3 12s ease-in-out infinite; }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(251,191,36,0.15) 50%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>

        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden"
          style={{ background: '#0d0d0d' }}>

          {/* Animated yellow orbs */}
          <div className="orb1 absolute w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%)', top: '5%', left: '5%', filter: 'blur(40px)' }} />
          <div className="orb2 absolute w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)', bottom: '10%', right: '5%', filter: 'blur(50px)' }} />
          <div className="orb3 absolute w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)', bottom: '20%', left: '20%', filter: 'blur(35px)' }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(251,191,36,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }} />

          {/* Logo + text centered */}
          <div className="relative z-10 flex flex-col items-center text-center px-12">
            <div className="shimmer relative mb-8 rounded-3xl overflow-hidden p-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <img
                src="/atomquest-logo.png"
                alt="AtomQuest"
                width={280}
                height={280}
                className="rounded-2xl"
                style={{ objectFit: 'contain' }}
              />
            </div>

            <p className="text-gray-500 text-base leading-relaxed max-w-xs">
              A Goal Setting & Tracking Portal<br />
              <span style={{ color: '#fbbf24' }}>powered by atomberg</span>
            </p>
          </div>

          {/* Bottom tagline */}
          <div className="absolute bottom-8 left-0 right-0 text-center z-10">
            <p className="text-xs text-gray-700 tracking-widest uppercase">
              Performance · Transparency · Growth
            </p>
          </div>
        </div>

        {/* RIGHT PANEL — unchanged from before */}
        <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#0a0a0a' }}>
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-10 lg:hidden">
              <img src="/atomquest-logo.png" alt="AtomQuest" width={40} height={40} className="rounded-xl" />
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
                  placeholder="you@atomberg.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  onFocus={e => e.target.style.borderColor = '#fbbf24'}
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
                  onFocus={e => e.target.style.borderColor = '#fbbf24'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 mb-6"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', color: '#0a0a0a' }}>
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
                      ;(e.target as HTMLElement).style.borderColor = '#fbbf24'
                      ;(e.target as HTMLElement).style.color = '#fbbf24'
                    }}
                    onMouseLeave={e => {
                      ;(e.target as HTMLElement).style.borderColor = '#2a2a2a'
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
    </>
  )
}