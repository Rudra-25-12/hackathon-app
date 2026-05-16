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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">AtomQuest Portal</h1>
        <p className="text-gray-500 text-sm mb-6">Goal Setting & Tracking</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
  <p className="text-xs text-gray-400 mb-2">Quick login as:</p>
  <div className="grid grid-cols-3 gap-2">
    {[
      { label: '👤 Employee', email: 'employee@demo.com' },
      { label: '🧑‍💼 Manager', email: 'manager@demo.com' },
      { label: '⚙️ Admin', email: 'admin@demo.com' },
    ].map(role => (
      <button
        key={role.email}
        onClick={() => { setEmail(role.email); setPassword('Demo@1234') }}
        className="text-xs border border-gray-200 rounded-lg py-2 px-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-500 transition text-center"
      >
        {role.label}
      </button>
    ))}
  </div>
  <p className="text-xs text-gray-300 text-center mt-2">click any role to autofill</p>
</div>
      </div>
    </div>
  )
}