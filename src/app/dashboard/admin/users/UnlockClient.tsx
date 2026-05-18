'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function UnlockClient({profiles,goals}:{profiles:any[];goals:any[]}) {
  const [unlocking,setUnlocking] = useState<string|null>(null)
  const [unlocked,setUnlocked] = useState<string[]>([])
  const supabase = createClient()
  const router = useRouter()

  const roleColors:Record<string,{color:string;bg:string}> = {
    admin:{color:'#fbbf24',bg:'rgba(251,191,36,0.12)'},
    manager:{color:'#a78bfa',bg:'rgba(139,92,246,0.12)'},
    employee:{color:'#60a5fa',bg:'rgba(96,165,250,0.12)'},
  }

  const handleUnlock = async (goalId:string, empName:string) => {
    setUnlocking(goalId)
    await supabase.from('goals').update({status:'draft'}).eq('id',goalId)
    const {data:{user}} = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      entity_type:'goal', entity_id:goalId,
      changed_by:user?.id,
      change_description:`Admin unlocked goal for ${empName}`
    })
    setUnlocked(p=>[...p,goalId])
    setUnlocking(null)
    toast.success('Goal unlocked for editing')
    router.refresh()
  }

  const employees = profiles.filter(p=>p.role==='employee')

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Admin</p>
        <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Users & Goal Management</h1>
        <p className="text-sm mt-1" style={{color:'#475569'}}>{profiles.length} users · Unlock approved goals for re-editing</p>
      </div>

      {/* Users table */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <div className="px-6 py-4" style={{borderBottom:'1px solid #2a3347'}}>
          <p className="font-bold" style={{color:'#f1f5f9'}}>All Users</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{borderBottom:'1px solid #2a3347'}}>
              {['Name','Role','Department','Reports To'].map(h=>(
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{color:'#334155'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.map(p=>{
              const manager = profiles.find(m=>m.id===p.manager_id)
              const rc = roleColors[p.role]??roleColors.employee
              return (
                <tr key={p.id} style={{borderBottom:'1px solid #1a2030'}}>
                  <td className="px-6 py-4 font-semibold" style={{color:'#e2e8f0'}}>{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-3 py-1 rounded-full font-semibold capitalize" style={{background:rc.bg,color:rc.color}}>{p.role}</span>
                  </td>
                  <td className="px-6 py-4" style={{color:'#475569'}}>{p.department??'—'}</td>
                  <td className="px-6 py-4" style={{color:'#475569'}}>{manager?.name??'—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Goal unlock section */}
      <div className="rounded-2xl overflow-hidden" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <div className="px-6 py-4" style={{borderBottom:'1px solid #2a3347'}}>
          <p className="font-bold" style={{color:'#f1f5f9'}}>Unlock Approved Goals</p>
          <p className="text-xs mt-0.5" style={{color:'#475569'}}>Unlocking sets goal back to draft so employee can re-edit and resubmit</p>
        </div>

        {goals.length===0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{color:'#334155'}}>No approved goals to unlock</p>
          </div>
        ):(
          <div>
            {employees.map(emp=>{
              const empGoals = goals.filter(g=>g.employee_id===emp.id)
              if(empGoals.length===0) return null
              return (
                <div key={emp.id}>
                  <div className="px-6 py-3" style={{background:'#242d3f',borderBottom:'1px solid #2a3347'}}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{color:'#60a5fa'}}>{emp.name}</p>
                  </div>
                  {empGoals.map(goal=>(
                    <div key={goal.id} className="flex items-center justify-between px-6 py-4" style={{borderBottom:'1px solid #1a2030'}}>
                      <div>
                        <p className="text-sm font-semibold" style={{color:'#e2e8f0'}}>{goal.title}</p>
                        <p className="text-xs mt-0.5" style={{color:'#475569'}}>{goal.thrust_area} · {goal.weightage}%</p>
                      </div>
                      {unlocked.includes(goal.id) ? (
                        <span className="text-xs px-3 py-1 rounded-full" style={{background:'rgba(251,191,36,0.12)',color:'#fbbf24'}}>Unlocked ✓</span>
                      ):(
                        <button onClick={()=>handleUnlock(goal.id,emp.name)} disabled={unlocking===goal.id}
                          className="text-xs px-4 py-1.5 rounded-lg font-bold disabled:opacity-50"
                          style={{background:'rgba(248,113,113,0.1)',color:'#f87171',border:'1px solid rgba(248,113,113,0.2)'}}>
                          {unlocking===goal.id?'Unlocking...':'🔓 Unlock'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}