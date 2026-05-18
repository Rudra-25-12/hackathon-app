'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const QUARTERS = ['Q1','Q2','Q3','Q4']
const STATUS_OPTIONS = [
  {value:'not_started',label:'⚪ Not Started'},
  {value:'on_track',label:'🟡 On Track'},
  {value:'completed',label:'🟢 Completed'},
]

function computeScore(uom:string,target:number,actual:number):number {
  if(!actual||!target) return 0
  switch(uom) {
    case 'numeric_min': return Math.min((actual/target)*100,100)
    case 'numeric_max': return Math.min((target/actual)*100,100)
    case 'zero': return actual===0?100:0
    case 'timeline': return actual<=target?100:Math.max(0,100-((actual-target)/target)*100)
    default: return 0
  }
}

const inputStyle = {background:'#242d3f',border:'1px solid #2a3347',color:'#e2e8f0'}

export default function CheckinClient({
  goals,
  existingCheckins,
  activeQuarter,
}: {
  goals: any[]
  existingCheckins: any[]
  activeQuarter: string
}) {
  const [quarter,setQuarter] = useState(activeQuarter)
  const [actuals,setActuals] = useState<Record<string,string>>({})
  const [statuses,setStatuses] = useState<Record<string,string>>({})
  const [saving,setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const getExisting = (id:string) => existingCheckins.find(c=>c.goal_id===id&&c.quarter===quarter)
  const getActual = (id:string) => actuals[id]??String(getExisting(id)?.actual_achievement??'')
  const getStatus = (id:string) => statuses[id]??getExisting(id)?.progress_status??'not_started'

  const handleSave = async () => {
    if (quarter !== activeQuarter) {
      return
    }

    setSaving(true)
    for (const goal of goals) {
      const actual = parseFloat(getActual(goal.id))
      if(isNaN(actual)) continue
      const existing = getExisting(goal.id)
      if(existing) {
        await supabase.from('checkins').update({actual_achievement:actual,progress_status:getStatus(goal.id)}).eq('id',existing.id)
      } else {
        await supabase.from('checkins').insert({goal_id:goal.id,quarter,actual_achievement:actual,progress_status:getStatus(goal.id)})
      }
    }

    // After saving, sync to shared group members
    for (const goal of goals) {
      if (!goal.is_shared || !goal.shared_group_id) continue
      const actual = parseFloat(getActual(goal.id))
      if (isNaN(actual)) continue

      const { data: linkedGoals } = await supabase
        .from('goals')
        .select('id')
        .eq('shared_group_id', goal.shared_group_id)
        .neq('id', goal.id)

      if (!linkedGoals?.length) continue

      for (const linked of linkedGoals) {
        const existingLinked = existingCheckins.find(
          c => c.goal_id === linked.id && c.quarter === quarter
        )
        if (existingLinked) {
          await supabase.from('checkins').update({
            actual_achievement: actual,
            progress_status: getStatus(goal.id),
          }).eq('id', existingLinked.id)
        } else {
          await supabase.from('checkins').insert({
            goal_id: linked.id,
            quarter,
            actual_achievement: actual,
            progress_status: getStatus(goal.id),
          })
        }
      }
    }

    setSaving(false)
    toast.success(`${quarter} check-in saved!`)
    router.refresh()
  }

  if(goals.length===0) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">🔒</p>
      <p className="font-semibold mb-1" style={{color:'#94a3b8'}}>No approved goals yet</p>
      <p className="text-sm" style={{color:'#475569'}}>Check-ins unlock once your manager approves your goals</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Employee</p>
          <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Quarterly Check-ins</h1>
          <p className="text-sm mt-1" style={{color:'#475569'}}>Log your actual achievement against each goal</p>
        </div>
        <div className="flex items-center gap-3">
          {quarter !== activeQuarter && (
            <p className="text-xs mr-auto" style={{color:'#f87171'}}>
              Only {activeQuarter} is currently active
            </p>
          )}
          <button onClick={handleSave} disabled={saving || quarter !== activeQuarter}
            className="px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
            style={{background:'linear-gradient(135deg,#fbbf24,#f97316)',color:'#0a0a0a'}}>
            {saving ? 'Saving...' : `Save ${quarter}`}
          </button>
        </div>
      </div>

      {/* Quarter selector */}
      <div className="flex gap-2 mb-6">
        {QUARTERS.map(q => {
          const isLocked = q !== activeQuarter
          return (
            <button key={q} onClick={() => !isLocked && setQuarter(q)}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: quarter === q ? 'rgba(251,191,36,0.15)' : '#1e2433',
                color: quarter === q ? '#fbbf24' : isLocked ? '#2a3347' : '#64748b',
                border: '1px solid',
                borderColor: quarter === q ? 'rgba(251,191,36,0.4)' : '#2a3347',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.45 : 1,
              }}>
              {q} {isLocked ? '🔒' : ''}
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        {goals.map(goal=>{
          const actual = parseFloat(getActual(goal.id))
          const score = isNaN(actual)?null:computeScore(goal.uom_type,goal.target,actual)
          const existing = getExisting(goal.id)
          return (
            <div key={goal.id} className="rounded-2xl p-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold" style={{color:'#f1f5f9'}}>{goal.title}</p>
                  <p className="text-xs mt-0.5" style={{color:'#475569'}}>
                    {goal.thrust_area} · Target: <strong style={{color:'#94a3b8'}}>{goal.target}</strong> · Weight: <strong style={{color:'#94a3b8'}}>{goal.weightage}%</strong>
                  </p>
                </div>
                {score!==null && (
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs mb-1" style={{color:'#475569'}}>Score</p>
                    <p className="text-2xl font-black" style={{color:score>=80?'#34d399':score>=50?'#fbbf24':'#f87171'}}>
                      {score.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{color:'#475569'}}>Actual Achievement</label>
                  <input type="number" value={getActual(goal.id)}
                    onChange={e=>setActuals(a=>({...a,[goal.id]:e.target.value}))}
                    placeholder={`Target: ${goal.target}`}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    style={inputStyle}/>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{color:'#475569'}}>Status</label>
                  <select value={getStatus(goal.id)} onChange={e=>setStatuses(s=>({...s,[goal.id]:e.target.value}))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    style={inputStyle}>
                    {STATUS_OPTIONS.map(s=><option key={s.value} value={s.value} style={{background:'#1e2433'}}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {score!==null && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{background:'#0f172a'}}>
                  <div className="h-full rounded-full transition-all"
                    style={{width:`${score}%`,background:score>=80?'linear-gradient(90deg,#34d399,#10b981)':score>=50?'#fbbf24':'#f87171'}}/>
                </div>
              )}

              {existing?.manager_comment && (
                <div className="mt-4 rounded-xl p-3" style={{background:'rgba(96,165,250,0.06)',border:'1px solid rgba(96,165,250,0.15)'}}>
                  <p className="text-xs font-medium mb-1" style={{color:'#60a5fa'}}>💬 Manager Comment</p>
                  <p className="text-xs" style={{color:'#94a3b8'}}>{existing.manager_comment}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}