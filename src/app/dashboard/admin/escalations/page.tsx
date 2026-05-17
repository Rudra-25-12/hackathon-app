import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import EscalationLogClient from './EscalationLogClient'

export default async function EscalationsPage() {
  const supabase = await createServerSupabaseClient()
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) redirect('/login')
  const {data:profile} = await supabase.from('profiles').select('role').eq('id',user.id).single()
  if(profile?.role!=='admin') redirect('/dashboard')

  const {data:profiles} = await supabase.from('profiles').select('*')
  const {data:goals} = await supabase.from('goals').select('*')
  const {data:checkins} = await supabase.from('checkins').select('*')
  const {data:cycle} = await supabase.from('cycle_settings').select('*').eq('id',1).single()
  const {data:logs} = await supabase.from('escalation_logs').select('*').order('created_at',{ascending:false})

  const employees = profiles?.filter(p=>p.role==='employee')??[]

  const activeEscalations = {
    noGoals: employees.filter(e=>!(goals?.some(g=>g.employee_id===e.id))),
    pendingApproval: employees.filter(e=>goals?.filter(g=>g.employee_id===e.id).some(g=>g.status==='submitted')),
    noCheckins: employees.filter(e=>{
      const empGoals = goals?.filter(g=>g.employee_id===e.id&&g.status==='approved')??[]
      if(empGoals.length===0) return false
      return !(checkins?.some(c=>empGoals.some(g=>g.id===c.goal_id)))
    }),
  }

  return <EscalationLogClient
    logs={logs??[]}
    profiles={profiles??[]}
    activeEscalations={activeEscalations}
    activeQuarter={cycle?.active_quarter??'Q1'}
  />
}