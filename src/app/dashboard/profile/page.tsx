import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: manager } = profile?.manager_id
    ? await supabase.from('profiles').select('name,department').eq('id', profile.manager_id).single()
    : { data: null }
  const { data: goals } = await supabase.from('goals').select('*').eq('employee_id', user.id)
  const { data: checkins } = await supabase.from('checkins').select('*').in('goal_id', goals?.map((goal) => goal.id) ?? ['none'])

  const approved = goals?.filter((goal) => goal.status === 'approved').length ?? 0
  const totalWeight = goals?.filter((goal) => goal.status === 'approved').reduce((sum, goal) => sum + goal.weightage, 0) ?? 0

  const roleColors: Record<string, { color: string; bg: string }> = {
    admin: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    manager: { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
    employee: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  }
  const rc = roleColors[profile?.role] ?? roleColors.employee
  const initials = profile?.name?.split(' ').map((name: string) => name[0]).join('').slice(0, 2).toUpperCase() || '??'

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: '#fbbf24' }}>Account</p>
        <h1 className="text-3xl font-black" style={{ color: '#f1f5f9' }}>My Profile</h1>
      </div>

      <div className="rounded-2xl p-6 mb-4 flex items-center gap-6" style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0" style={{ background: rc.bg, color: rc.color, border: `2px solid ${rc.color}33` }}>
          {initials}
        </div>
        <div>
          <h2 className="text-2xl font-black mb-1" style={{ color: '#f1f5f9' }}>{profile?.name}</h2>
          <span className="text-xs px-3 py-1 rounded-full font-bold capitalize" style={{ background: rc.bg, color: rc.color }}>{profile?.role}</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
        {[
          { label: 'Email', value: user.email ?? '—' },
          { label: 'Department', value: profile?.department ?? '—' },
          { label: 'Reports To', value: manager?.name ?? '—' },
          { label: 'Role', value: profile?.role ?? '—' },
        ].map((row, index) => (
          <div key={row.label} className="flex items-center px-6 py-4" style={{ borderBottom: index < 3 ? '1px solid #1a2030' : 'none' }}>
            <p className="w-32 text-xs font-semibold uppercase tracking-wider" style={{ color: '#334155' }}>{row.label}</p>
            <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{row.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Goals', value: goals?.length ?? 0, color: '#60a5fa' },
          { label: 'Approved', value: approved, color: '#34d399' },
          { label: 'Check-ins', value: checkins?.length ?? 0, color: '#a78bfa' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl p-5" style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
            <p className="text-xs mb-2" style={{ color: '#475569' }}>{item.label}</p>
            <p className="text-3xl font-black" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}