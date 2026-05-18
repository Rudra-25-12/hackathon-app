import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

function computeScore(uom: string, target: number, actual: number): number {
  if (!actual || !target) return 0
  switch (uom) {
    case 'numeric_min': return Math.min((actual / target) * 100, 100)
    case 'numeric_max': return Math.min((target / actual) * 100, 100)
    case 'zero': return actual === 0 ? 100 : 0
    case 'timeline': return actual <= target ? 100 : Math.max(0, 100 - ((actual - target) / target) * 100)
    default: return 0
  }
}

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goal } = await supabase.from('goals').select('*').eq('id', id).single()
  if (!goal || goal.employee_id !== user.id) redirect('/dashboard/employee')

  const { data: checkins } = await supabase.from('checkins').select('*').eq('goal_id', id).order('quarter')

  const uomLabels: Record<string, string> = {
    numeric_min: 'Higher is better',
    numeric_max: 'Lower is better',
    timeline: 'Timeline (days)',
    zero: 'Zero-based',
  }
  const statusConfig: Record<string, { color: string; bg: string }> = {
    draft: { color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
    submitted: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    approved: { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  }
  const sc = statusConfig[goal.status] ?? statusConfig.draft

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <a href="/dashboard/employee" className="text-sm font-medium" style={{ color: '#475569' }}>← Back</a>
        <span style={{ color: '#2a3347' }}>/</span>
        <span className="text-sm" style={{ color: '#94a3b8' }}>Goal Detail</span>
      </div>

      <div className="rounded-2xl p-6 mb-4" style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: sc.bg, color: sc.color }}>{goal.status}</span>
              {goal.is_shared && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>Shared</span>}
            </div>
            <h1 className="text-xl font-black mb-1" style={{ color: '#f1f5f9' }}>{goal.title}</h1>
            {goal.description && <p className="text-sm" style={{ color: '#475569' }}>{goal.description}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Thrust Area', value: goal.thrust_area },
            { label: 'UoM Type', value: uomLabels[goal.uom_type] },
            { label: 'Target', value: goal.target },
            { label: 'Weightage', value: `${goal.weightage}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: '#242d3f' }}>
              <p className="text-xs mb-1" style={{ color: '#334155' }}>{item.label}</p>
              <p className="font-bold text-sm" style={{ color: '#e2e8f0' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #2a3347' }}>
          <p className="font-bold" style={{ color: '#f1f5f9' }}>Check-in History</p>
        </div>
        {!checkins || checkins.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#334155' }}>No check-ins yet</p>
          </div>
        ) : (
          checkins.map((checkin, index) => {
            const score = computeScore(goal.uom_type, goal.target, checkin.actual_achievement)
            return (
              <div key={checkin.id} className="p-6" style={{ borderBottom: index < checkins.length - 1 ? '1px solid #1a2030' : 'none' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>{checkin.quarter}</span>
                  <p className="text-xl font-black" style={{ color: score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171' }}>{score.toFixed(0)}%</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-xl p-3" style={{ background: '#242d3f' }}>
                    <p className="text-xs mb-1" style={{ color: '#334155' }}>Actual</p>
                    <p className="font-bold" style={{ color: '#60a5fa' }}>{checkin.actual_achievement}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: '#242d3f' }}>
                    <p className="text-xs mb-1" style={{ color: '#334155' }}>Status</p>
                    <p className="font-bold capitalize text-sm" style={{ color: '#94a3b8' }}>{checkin.progress_status?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#0f172a' }}>
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: score >= 80 ? 'linear-gradient(90deg,#34d399,#10b981)' : score >= 50 ? '#fbbf24' : '#f87171' }} />
                </div>
                {checkin.manager_comment && (
                  <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#60a5fa' }}>💬 Manager</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{checkin.manager_comment}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}