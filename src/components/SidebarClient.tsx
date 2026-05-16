'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

const employeeLinks = [
  { href: '/dashboard/employee', label: 'My Goals', icon: '🎯' },
  { href: '/dashboard/employee/goals/new', label: 'New Goal', icon: '✚' },
  { href: '/dashboard/employee/checkins', label: 'Check-ins', icon: '📋' },
]

const managerLinks = [
  { href: '/dashboard/manager', label: 'Team Dashboard', icon: '📊' },
  { href: '/dashboard/manager/approvals', label: 'Approvals', icon: '✅' },
  { href: '/dashboard/manager/checkins', label: 'Check-ins', icon: '📋' },
  { href: '/dashboard/manager/shared', label: 'Push Shared Goal', icon: '🔗' },
]

const adminLinks = [
  { href: '/dashboard/admin', label: 'Overview', icon: '🏠' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: '📈' },
  { href: '/dashboard/admin/audit', label: 'Audit Log', icon: '🔍' },
  { href: '/dashboard/admin/cycle', label: 'Cycle Settings', icon: '⚙️' },
]

export default function SidebarClient({ profile }: { profile: any }) {
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const links = profile?.role === 'manager'
    ? managerLinks
    : profile?.role === 'admin'
    ? adminLinks
    : employeeLinks

  const roleColor: Record<string, string> = {
    employee: '#3b82f6',
    manager: '#8b5cf6',
    admin: '#fbbf24',
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <style>{`
        .nav-link { transition: all 0.15s ease; }
        .nav-link:hover { background: rgba(251,191,36,0.08); }
        .nav-link.active { background: rgba(251,191,36,0.12); border-left: 2px solid #fbbf24; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
      `}</style>

      <aside className="w-60 flex flex-col shrink-0"
        style={{ background: '#111', borderRight: '1px solid #1f1f1f', minHeight: '100vh' }}>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid #1f1f1f' }}>
          <img src="/atomquest-logo.png" alt="AtomQuest" className="w-8 h-8 rounded-lg object-contain"
            style={{ background: '#fbbf24' }} />
          <div>
            <p className="text-white font-black text-sm leading-tight">AtomQuest</p>
            <p className="text-gray-600 text-xs">by Atomberg</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full pulse-dot"
              style={{ background: roleColor[profile?.role] ?? '#fbbf24' }} />
            <span className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: roleColor[profile?.role] ?? '#fbbf24' }}>
              {profile?.role}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <a key={link.href} href={link.href}
                className={`nav-link ${isActive ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm`}
                style={{
                  color: isActive ? '#fbbf24' : '#6b7280',
                  borderLeft: isActive ? '2px solid #fbbf24' : '2px solid transparent',
                }}>
                <span className="text-base">{link.icon}</span>
                <span className={isActive ? 'font-semibold' : 'font-medium'}>{link.label}</span>
              </a>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4" style={{ borderTop: '1px solid #1f1f1f' }}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">{profile?.name}</p>
              <p className="text-gray-600 text-xs truncate">{profile?.department}</p>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut}
            className="w-full py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: '#1a1a1a', color: '#6b7280', border: '1px solid #2a2a2a' }}
            onMouseEnter={e => {
              ;(e.target as HTMLElement).style.borderColor = '#ef4444'
              ;(e.target as HTMLElement).style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              ;(e.target as HTMLElement).style.borderColor = '#2a2a2a'
              ;(e.target as HTMLElement).style.color = '#6b7280'
            }}>
            {loggingOut ? 'Signing out...' : '← Sign out'}
          </button>
        </div>
      </aside>
    </>
  )
}