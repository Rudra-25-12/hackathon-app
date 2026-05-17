import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminCharts from './AdminCharts'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: allProfiles } = await supabase.from('profiles').select('*')
  const { data: allGoals } = await supabase.from('goals').select('*')
  const { data: allCheckins } = await supabase.from('checkins').select('*')
  const { data: cycle } = await supabase
    .from('cycle_settings').select('*').eq('id', 1).single()

  const employees = allProfiles?.filter(p => p.role === 'employee') ?? []
  const managers = allProfiles?.filter(p => p.role === 'manager') ?? []

  const departments = [...new Set(allProfiles?.map(p => p.department).filter(Boolean))]
  const deptStats = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept)
    const deptGoals = allGoals?.filter(g => deptEmployees.some(e => e.id === g.employee_id)) ?? []
    return {
      dept,
      total: deptGoals.length,
      approved: deptGoals.filter(g => g.status === 'approved').length,
      submitted: deptGoals.filter(g => g.status === 'submitted').length,
    }
  })

  const quarterStats = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
    const qCheckins = allCheckins?.filter(c => c.quarter === q) ?? []
    return {
      quarter: q,
      completed: qCheckins.filter(c => c.progress_status === 'completed').length,
      onTrack: qCheckins.filter(c => c.progress_status === 'on_track').length,
      notStarted: qCheckins.filter(c => c.progress_status === 'not_started').length,
      total: qCheckins.length,
    }
  })

  const escalations = {
    noGoals: employees.filter(e => !(allGoals?.some(g => g.employee_id === e.id))),
    pendingApproval: employees.filter(e =>
      allGoals?.filter(g => g.employee_id === e.id).some(g => g.status === 'submitted')
    ),
    noCheckins: employees.filter(e => {
      const empGoals = allGoals?.filter(g => g.employee_id === e.id && g.status === 'approved') ?? []
      if (empGoals.length === 0) return false
      return !(allCheckins?.some(c => empGoals.some(g => g.id === c.goal_id)))
    }),
  }

  const managerStats = managers.map(m => {
    const team = employees.filter(e => e.manager_id === m.id)
    const teamGoals = allGoals?.filter(g => team.some(e => e.id === g.employee_id)) ?? []
    return {
      name: m.name,
      approved: teamGoals.filter(g => g.status === 'approved').length,
      pending: teamGoals.filter(g => g.status === 'submitted').length,
      checkinsDone: allCheckins?.filter(c => teamGoals.some(g => g.id === c.goal_id) && c.manager_comment).length ?? 0,
      teamSize: team.length,
    }
  })

  const thrustAreas = [...new Set(allGoals?.map(g => g.thrust_area).filter(Boolean))]
  const thrustStats = thrustAreas.map(area => ({
    area,
    count: allGoals?.filter(g => g.thrust_area === area).length ?? 0,
  })).sort((a,b) => b.count - a.count)

  return (
    <AdminCharts
      deptStats={deptStats}
      quarterStats={quarterStats}
      escalations={escalations}
      managerStats={managerStats}
      allProfiles={allProfiles ?? []}
      allGoals={allGoals ?? []}
      allCheckins={allCheckins ?? []}
      thrustStats={thrustStats}
      summary={{
        employees: employees.length,
        totalGoals: allGoals?.length ?? 0,
        approvedGoals: allGoals?.filter(g => g.status === 'approved').length ?? 0,
        pendingGoals: allGoals?.filter(g => g.status === 'submitted').length ?? 0,
        activeQuarter: cycle?.active_quarter ?? 'Q1',
        goalSettingOpen: cycle?.goal_setting_open ?? true,
      }}
    />
  )
}