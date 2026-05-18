'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, Menu, X } from 'lucide-react'
import AtomQuestLogo from '../../public/atomquest-logo.png'

// Define proper types
interface NavLink {
  href: string;
  label: string;
  icon: string;
  badge?: boolean;
}

const employeeLinks: NavLink[] = [
  { href: '/dashboard/employee', label: 'My Goals', icon: '🎯' },
  { href: '/dashboard/profile', label: 'My Profile', icon: '👤' },
  { href: '/dashboard/employee/goals/new', label: 'New Goal', icon: '✚' },
  { href: '/dashboard/employee/checkins', label: 'Check-ins', icon: '📋' },
]

const managerLinks: NavLink[] = [
  { href: '/dashboard/manager', label: 'Team Dashboard', icon: '📊' },
  { href: '/dashboard/profile', label: 'My Profile', icon: '👤' },
  { href: '/dashboard/manager/approvals', label: 'Approvals', icon: '✅', badge: true },
  { href: '/dashboard/manager/checkins', label: 'Check-ins', icon: '📋' },
  { href: '/dashboard/manager/shared', label: 'Push Shared Goal', icon: '🔗' },
]

const adminLinks: NavLink[] = [
  { href: '/dashboard/admin', label: 'Overview', icon: '🏠' },
  { href: '/dashboard/profile', label: 'My Profile', icon: '👤' },
  { href: '/dashboard/admin/escalations', label: 'Escalations', icon: '⚠️' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: '📈' },
  { href: '/dashboard/admin/audit', label: 'Audit Log', icon: '🔍' },
  { href: '/dashboard/admin/cycle', label: 'Cycle Settings', icon: '⚙️' },
]

interface Profile {
  role?: 'employee' | 'manager' | 'admin';
  name?: string;
  department?: string;
}

export default function SidebarClient({ profile, pendingCount }: { profile: Profile; pendingCount: number }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
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

  const rc = roleColors[profile?.role || 'admin']
  const initials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) setIsCollapsed(saved === 'true')
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Top Bar */}
      {/* Mobile Top Bar */}
<div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50 px-4 py-3 flex items-center">
  <button
    onClick={() => setIsMobileOpen(true)}
    className="text-white p-2 -ml-2"
  >
    <Menu className="w-6 h-6" />
  </button>
  <div className="ml-3 font-bold text-lg text-white">AtomQuest</div>
</div>

      {/* Sidebar */}
      <aside className={`fixed md:relative h-screen bg-gray-900 border-r border-[#252d3d] 
        flex flex-col shrink-0 transition-all duration-300 z-50
        ${isCollapsed ? 'w-20' : 'w-60'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Logo Header */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-[#252d3d]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#fbbf24]">
              <Image
                src={AtomQuestLogo}
                alt="AQ"
                width={32}
                height={32}
                priority
                unoptimized
                style={{ objectFit: 'contain' }}
              />
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-black text-sm leading-tight text-[#f1f5f9]">AtomQuest</p>
                <p className="text-xs text-[#475569]">by Atomberg</p>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="hidden md:block text-gray-400 hover:text-white p-1"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: rc.bg }}>
          <div className="w-2 h-2 rounded-full" style={{ background: rc.dot }} />
          {!isCollapsed && (
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: rc.text }}>
              {profile?.role}
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'sidebar-link-active' : ''}`}
                style={{ 
                  color: isActive ? '#fbbf24' : '#94a3b8',
                  justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}
                title={isCollapsed ? link.label : ''}
              >
                <span className="text-lg">{link.icon}</span>
                  {!isCollapsed && <span className="flex-1">{link.label}</span>}
                  {!isCollapsed && link.badge && pendingCount > 0 && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#f87171', color: 'white', minWidth: 18, textAlign: 'center' }}
                    >
                      {pendingCount}
                    </span>
                  )}
              </a>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#252d3d]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
              style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.dot}33` }}>
              {initials}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-[#e2e8f0]">{profile?.name}</p>
                <p className="text-xs truncate text-[#475569]">{profile?.department}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: '#252d3d', color: '#64748b', border: '1px solid #2d3748' }}
          >
            {loggingOut ? 'Signing out...' : isCollapsed ? '←' : '← Sign out'}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Close Button */}
      {isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(false)}
          className="fixed top-4 right-4 z-50 md:hidden text-white bg-gray-800 p-2 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </>
  )
}