'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const THRUST_AREAS = ['Revenue Growth','Cost Optimization','Customer Satisfaction','People Development','Process Improvement','Innovation','Compliance & Risk','Digital Transformation']
const UOM_TYPES = [
  { value: 'numeric_min', label: 'Numeric — Higher is better (e.g. Sales)' },
  { value: 'numeric_max', label: 'Numeric — Lower is better (e.g. Cost)' },
  { value: 'timeline', label: 'Timeline — Date-based completion' },
  { value: 'zero', label: 'Zero-based — 0 = Success (e.g. Incidents)' },
]

interface GoalRow { title: string; description: string; thrust_area: string; uom_type: string; target: string; weightage: string }
const emptyGoal = (): GoalRow => ({ title:'', description:'', thrust_area: THRUST_AREAS[0], uom_type:'numeric_min', target:'', weightage:'' })

const inputStyle = { background:'#242d3f', border:'1px solid #2a3347', color:'#e2e8f0' }
const labelStyle = { color:'#475569' }

export default function NewGoalPage() {
  const [goals, setGoals] = useState<GoalRow[]>([emptyGoal()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const total = goals.reduce((s,g) => s + (parseFloat(g.weightage)||0), 0)
  const valid = total === 100

  const update = (i: number, f: keyof GoalRow, v: string) =>
    setGoals(p => p.map((g,idx) => idx===i ? {...g,[f]:v} : g))

  const validate = () => {
    for (const g of goals) {
      if (!g.title.trim()) return 'All goals need a title'
      if (!g.target.trim()) return 'All goals need a target'
      if (isNaN(parseFloat(g.weightage)) || parseFloat(g.weightage) < 10) return 'Min 10% weightage per goal'
    }
    if (!valid) return `Total must be 100% (currently ${total}%)`
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { count } = await supabase.from('goals').select('*',{count:'exact',head:true}).eq('employee_id', user.id)
    if ((count??0)+goals.length > 8) { setError(`Max 8 goals. You have ${count}.`); setSubmitting(false); return }
    const inserts = goals.map(g => ({
      employee_id: user.id, title: g.title.trim(), description: g.description.trim(),
      thrust_area: g.thrust_area, uom_type: g.uom_type,
      target: parseFloat(g.target), weightage: parseFloat(g.weightage), status:'submitted'
    }))
    const { error: e } = await supabase.from('goals').insert(inserts)
    if (e) { setError('Something went wrong.'); setSubmitting(false); return }
    await fetch('/api/email/submitted',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({employeeId: user.id, goalCount: inserts.length}) })
    router.push('/dashboard/employee')
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Employee</p>
          <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Create Goal Sheet</h1>
          <p className="text-sm mt-1" style={{color:'#475569'}}>Max 8 goals · Total weightage must equal 100%</p>
        </div>
      </div>

      {/* Weightage tracker */}
      <div className="rounded-2xl p-5 mb-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{color:'#94a3b8'}}>Total Weightage</p>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{color:'#475569'}}>{goals.length}/8 goals</span>
            {valid && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:'rgba(52,211,153,0.12)',color:'#34d399'}}>✓ Valid</span>}
          </div>
        </div>
        <p className="text-4xl font-black mb-3" style={{color: valid?'#34d399':total>100?'#f87171':'#fbbf24'}}>
          {total}% <span className="text-lg font-normal" style={{color:'#334155'}}>/ 100%</span>
        </p>
        <div className="h-2 rounded-full overflow-hidden" style={{background:'#0f172a'}}>
          <div className="h-full rounded-full transition-all" style={{
            width:`${Math.min(total,100)}%`,
            background: valid?'linear-gradient(90deg,#34d399,#10b981)':total>100?'#f87171':'linear-gradient(90deg,#fbbf24,#f97316)'
          }}/>
        </div>
      </div>

      {/* Goal cards */}
      <div className="space-y-4 mb-4">
        {goals.map((goal,i) => (
          <div key={i} className="rounded-2xl p-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold" style={{color:'#f1f5f9'}}>Goal {i+1}</h3>
              {goals.length > 1 && (
                <button onClick={() => setGoals(p=>p.filter((_,idx)=>idx!==i))}
                  className="text-xs font-medium" style={{color:'#f87171'}}>Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Goal Title *</label>
                <input value={goal.title} onChange={e=>update(i,'title',e.target.value)}
                  placeholder="e.g. Increase quarterly sales revenue"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={inputStyle}/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Description</label>
                <textarea value={goal.description} onChange={e=>update(i,'description',e.target.value)}
                  placeholder="Brief context for this goal..." rows={2}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none"
                  style={inputStyle}/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Thrust Area *</label>
                <select value={goal.thrust_area} onChange={e=>update(i,'thrust_area',e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={inputStyle}>
                  {THRUST_AREAS.map(a=><option key={a} style={{background:'#1e2433'}}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Unit of Measurement *</label>
                <select value={goal.uom_type} onChange={e=>update(i,'uom_type',e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={inputStyle}>
                  {UOM_TYPES.map(u=><option key={u.value} value={u.value} style={{background:'#1e2433'}}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Target *</label>
                <input type="number" value={goal.target} onChange={e=>update(i,'target',e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={inputStyle}/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Weightage % * (min 10%)</label>
                <input type="number" value={goal.weightage} onChange={e=>update(i,'weightage',e.target.value)}
                  placeholder="e.g. 25" min={10} max={100}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={inputStyle}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {goals.length < 8 && (
        <button onClick={()=>setGoals(p=>[...p,emptyGoal()])}
          className="w-full py-4 rounded-2xl text-sm font-medium mb-6 transition-all"
          style={{border:'2px dashed #2a3347',color:'#475569'}}>
          + Add Another Goal
        </button>
      )}

      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm"
          style={{background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',color:'#f87171'}}>
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button onClick={()=>router.back()}
          className="px-5 py-2.5 text-sm font-medium rounded-xl"
          style={{background:'#1e2433',color:'#64748b',border:'1px solid #2a3347'}}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          className="px-6 py-2.5 text-sm font-bold rounded-xl disabled:opacity-60"
          style={{background:'linear-gradient(135deg,#fbbf24,#f97316)',color:'#0a0a0a'}}>
          {submitting ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </div>
    </div>
  )
}