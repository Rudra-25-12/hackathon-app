'use client'
import Image from 'next/image'
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
  { href: '/dashboard/admin/escalations', label: 'Escalations', icon: '⚠️' },
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

  const links = profile?.role === 'manager' ? managerLinks
    : profile?.role === 'admin' ? adminLinks
    : employeeLinks

  const roleColors: Record<string, { bg: string; text: string; dot: string }> = {
    employee: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', dot: '#3b82f6' },
    manager:  { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', dot: '#8b5cf6' },
    admin:    { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', dot: '#fbbf24' },
  }
  const rc = roleColors[profile?.role] ?? roleColors.admin
  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 flex flex-col shrink-0 sidebar-noise"
      style={{ borderRight: '1px solid #252d3d', minHeight: '100vh' }}>

      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid #252d3d' }}>
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0"
          style={{ background: '#fbbf24' }}>
          <Image
            src="/atomquest-logo.png"
            alt="AQ"
            width={32}
            height={32}
            priority
            unoptimized
            style={{ objectFit: 'contain', borderRadius: 8, background: '#fbbf24' }}
          />
        </div>
        <div>
          <p className="font-black text-sm leading-tight" style={{ color: '#f1f5f9' }}>AtomQuest</p>
          <p className="text-xs" style={{ color: '#475569' }}>by Atomberg</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-lg flex items-center gap-2"
        style={{ background: rc.bg }}>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: rc.dot }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: rc.text }}>
          {profile?.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {links.map(link => {
          const isActive = pathname === link.href
          return (
            <a key={link.href} href={link.href}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'sidebar-link-active' : ''}`}
              style={{ color: isActive ? '#fbbf24' : '#94a3b8' }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4" style={{ borderTop: '1px solid #252d3d' }}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.dot}33` }}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{profile?.name}</p>
            <p className="text-xs truncate" style={{ color: '#475569' }}>{profile?.department}</p>
          </div>
        </div>
        <button onClick={handleLogout} disabled={loggingOut}
          className="w-full py-2 rounded-lg text-xs font-medium transition-all"
          style={{ background: '#252d3d', color: '#64748b', border: '1px solid #2d3748' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#f87171'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#f8717133'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#64748b'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#2d3748'
          }}>
          {loggingOut ? 'Signing out...' : '← Sign out'}
        </button>
      </div>
    </aside>
  )
}
