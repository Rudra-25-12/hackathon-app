import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function ManagerDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('name, role, department').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/dashboard')

  const { data: teamMembers } = await supabase
    .from('profiles').select('id, name, department').eq('manager_id', user.id)

  const teamIds = teamMembers?.map(m => m.id) ?? []

  const { data: goals } = await supabase
    .from('goals').select('*')
    .in('employee_id', teamIds.length > 0 ? teamIds : ['none'])

  const { data: checkins } = await supabase
    .from('checkins').select('*')
    .in('goal_id', goals?.map(g => g.id).length ? goals.map(g => g.id) : ['none'])

  const submitted = goals?.filter(g => g.status === 'submitted').length ?? 0
  const approved = goals?.filter(g => g.status === 'approved').length ?? 0
  const rejected = goals?.filter(g => g.status === 'rejected').length ?? 0
  const totalGoals = goals?.length ?? 0

  return (
    <>
      <style>{`
        .member-row:hover { background: #242d3f !important; }
        .member-row { transition: background 0.15s ease; }
      `}</style>

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#fbbf24' }}>Manager Panel</p>
            <h1 className="text-3xl font-black" style={{ color: '#f1f5f9' }}>{profile?.name}</h1>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>
              {profile?.department} · {teamMembers?.length ?? 0} direct reports
            </p>
          </div>
          <a href="/dashboard/manager/approvals"
            className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', color: '#0a0a0a' }}>
            Review Approvals {submitted > 0 && `(${submitted})`}
          </a>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Team Size', value: teamMembers?.length ?? 0, color: '#60a5fa', sub: 'direct reports' },
            { label: 'Pending Approval', value: submitted, color: '#fbbf24', sub: submitted > 0 ? '⚠ action needed' : '✓ all clear' },
            { label: 'Approved Goals', value: approved, color: '#34d399', sub: 'locked in' },
            { label: 'Check-ins Done', value: checkins?.length ?? 0, color: '#a78bfa', sub: 'across all quarters' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
              <p className="text-xs font-medium mb-3" style={{ color: '#475569' }}>{s.label}</p>
              <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: '#334155' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Pending alert */}
        {submitted > 0 && (
          <div className="rounded-2xl p-4 mb-6 flex items-center justify-between"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">⏳</span>
              <div>
                <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>
                  {submitted} goal{submitted > 1 ? 's' : ''} waiting for your approval
                </p>
                <p className="text-xs" style={{ color: '#475569' }}>Review and approve your team's submissions</p>
              </div>
            </div>
            <a href="/dashboard/manager/approvals"
              className="px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              Go to Approvals →
            </a>
          </div>
        )}

        {/* Team overview */}
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #2a3347' }}>
            <h2 className="font-bold" style={{ color: '#f1f5f9' }}>Team Overview</h2>
            <div className="flex gap-2">
              {[
                { label: `${approved} Approved`, color: '#34d399' },
                { label: `${submitted} Pending`, color: '#fbbf24' },
                { label: `${rejected} Rejected`, color: '#f87171' },
              ].map(b => (
                <span key={b.label} className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ background: `${b.color}18`, color: b.color }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {!teamMembers || teamMembers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-semibold mb-1" style={{ color: '#94a3b8' }}>No team members yet</p>
              <p className="text-sm" style={{ color: '#334155' }}>Team members will appear once assigned</p>
            </div>
          ) : (
            <div>
              {teamMembers.map((member, i) => {
                const memberGoals = goals?.filter(g => g.employee_id === member.id) ?? []
                const memberApproved = memberGoals.filter(g => g.status === 'approved').length
                const memberPending = memberGoals.filter(g => g.status === 'submitted').length
                const memberCheckins = checkins?.filter(c =>
                  memberGoals.some(g => g.id === c.goal_id)
                ).length ?? 0
                const totalWeight = memberGoals
                  .filter(g => g.status === 'approved')
                  .reduce((s, g) => s + g.weightage, 0)
                const completion = memberGoals.length > 0
                  ? Math.round((memberApproved / memberGoals.length) * 100)
                  : 0

                return (
                  <div key={member.id} className="member-row px-6 py-5"
                    style={{ borderBottom: i < teamMembers.length - 1 ? '1px solid #1a2030' : 'none' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                          style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                          {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{member.name}</p>
                          <p className="text-xs" style={{ color: '#475569' }}>{member.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {memberPending > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
                            {memberPending} pending
                          </span>
                        )}
                        <a href="/dashboard/manager/approvals"
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: '#242d3f', color: '#94a3b8', border: '1px solid #2a3347' }}>
                          View Goals →
                        </a>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {[
                        { label: 'Total Goals', value: memberGoals.length, color: '#94a3b8' },
                        { label: 'Approved', value: memberApproved, color: '#34d399' },
                        { label: 'Check-ins', value: memberCheckins, color: '#a78bfa' },
                        { label: 'Weight', value: `${totalWeight}%`, color: '#60a5fa' },
                      ].map(s => (
                        <div key={s.label} className="rounded-lg p-2.5 text-center"
                          style={{ background: '#242d3f' }}>
                          <p className="text-xs mb-1" style={{ color: '#334155' }}>{s.label}</p>
                          <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Completion bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs" style={{ color: '#334155' }}>Approval completion</p>
                        <p className="text-xs font-bold"
                          style={{ color: completion === 100 ? '#34d399' : '#fbbf24' }}>
                          {completion}%
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#0f172a' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${completion}%`,
                            background: completion === 100
                              ? 'linear-gradient(90deg,#34d399,#10b981)'
                              : 'linear-gradient(90deg,#fbbf24,#f97316)'
                          }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Goal Approvals', desc: 'Review & approve team goals', href: '/dashboard/manager/approvals', color: '#fbbf24', icon: '✅' },
            { label: 'Team Check-ins', desc: 'View actuals & add comments', href: '/dashboard/manager/checkins', color: '#34d399', icon: '📋' },
            { label: 'Push Shared Goal', desc: 'Assign KPI to team members', href: '/dashboard/manager/shared', color: '#a78bfa', icon: '🔗' },
          ].map(l => (
            <a key={l.href} href={l.href}
              className="rounded-2xl p-5 block transition-all"
              style={{ background: '#1e2433', border: '1px solid #2a3347' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = l.color + '44'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#2a3347'}>
              <p className="text-2xl mb-3">{l.icon}</p>
              <p className="font-bold text-sm mb-1" style={{ color: '#e2e8f0' }}>{l.label}</p>
              <p className="text-xs" style={{ color: '#475569' }}>{l.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}