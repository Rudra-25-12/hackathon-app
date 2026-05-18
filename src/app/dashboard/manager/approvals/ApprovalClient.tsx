'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Goal { id:string; employee_id:string; employee_name:string; title:string; description:string; thrust_area:string; uom_type:string; target:number; weightage:number; status:string }
interface TeamMember { id:string; name:string; department:string }

const inputStyle = { background:'#242d3f', border:'1px solid #2a3347', color:'#e2e8f0' }

export default function ApprovalClient({ goals, teamMembers }: { goals:Goal[]; teamMembers:TeamMember[] }) {
  const [selected, setSelected] = useState('all')
  const [editing, setEditing] = useState<string|null>(null)
  const [editVals, setEditVals] = useState({target:'',weightage:''})
  const [rejectNote, setRejectNote] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState<string|null>(null)
  const supabase = createClient()
  const router = useRouter()

  const filtered = selected==='all' ? goals : goals.filter(g=>g.employee_id===selected)
  const grouped = filtered.reduce<Record<string,Goal[]>>((acc,g)=>{
    if(!acc[g.employee_name]) acc[g.employee_name]=[]
    acc[g.employee_name].push(g); return acc
  },{})

  const handleApprove = async (goalId:string) => {
    setLoading(goalId)
    await supabase.from('goals').update({status:'approved'}).eq('id',goalId)
    const {data:{user}} = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({entity_type:'goal',entity_id:goalId,changed_by:user?.id,change_description:'Goal approved by manager'})
    const goal = goals.find(g=>g.id===goalId)
    if(goal) await fetch('/api/email/approved',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goalId,employeeId:goal.employee_id})})
    toast.success('Goal approved!')
    setLoading(null); router.refresh()
  }

  const handleReject = async (goalId:string) => {
    setLoading(goalId)
    await supabase.from('goals').update({status:'rejected'}).eq('id',goalId)
    const {data:{user}} = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({entity_type:'goal',entity_id:goalId,changed_by:user?.id,change_description:`Rejected. Note: ${rejectNote[goalId]||'none'}`})
    const goal = goals.find(g=>g.id===goalId)
    if(goal) await fetch('/api/email/rejected',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goalId,employeeId:goal.employee_id,note:rejectNote[goalId]||''})})
    toast.error('Goal rejected')
    setLoading(null); router.refresh()
  }

  const handleSaveEdit = async (goalId:string) => {
    setLoading(goalId)
    await supabase.from('goals').update({target:parseFloat(editVals.target),weightage:parseFloat(editVals.weightage)}).eq('id',goalId)
    const {data:{user}} = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({entity_type:'goal',entity_id:goalId,changed_by:user?.id,change_description:`Manager edited: target→${editVals.target}, weightage→${editVals.weightage}%`})
    toast.success('Goal updated!')
    setEditing(null); setLoading(null); router.refresh()
  }

  const uomLabel:Record<string,string> = {numeric_min:'Higher is better',numeric_max:'Lower is better',timeline:'Timeline',zero:'Zero-based'}

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Manager</p>
          <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Goal Approvals</h1>
          <p className="text-sm mt-1" style={{color:'#475569'}}>Review, edit and approve your team's goals</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all',...teamMembers.map(m=>m.id)].map(id=>{
          const label = id==='all'?'All Team':teamMembers.find(m=>m.id===id)?.name??''
          return (
            <button key={id} onClick={()=>setSelected(id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{background:selected===id?'#fbbf24':' #1e2433',color:selected===id?'#0a0a0a':'#64748b',border:'1px solid',borderColor:selected===id?'#fbbf24':'#2a3347'}}>
              {label}
            </button>
          )
        })}
      </div>

      {Object.keys(grouped).length===0 ? (
        <div className="rounded-2xl p-16 text-center" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold mb-1" style={{color:'#94a3b8'}}>No goals submitted yet</p>
          <p className="text-sm" style={{color:'#334155'}}>Goals appear here once your team submits them</p>
        </div>
      ) : (
        Object.entries(grouped).map(([name,empGoals])=>{
          const totalW = empGoals.reduce((s,g)=>s+g.weightage,0)
          const allApproved = empGoals.every(g=>g.status==='approved')
          return (
            <div key={name} className="rounded-2xl overflow-hidden mb-4" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
              <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:'1px solid #2a3347'}}>
                <div>
                  <p className="font-bold" style={{color:'#f1f5f9'}}>{name}</p>
                  <p className="text-xs mt-0.5" style={{color:'#475569'}}>
                    {empGoals.length} goals · Weightage:
                    <span className="ml-1 font-bold" style={{color:totalW===100?'#34d399':'#f87171'}}>{totalW}%</span>
                  </p>
                </div>
                {allApproved && <span className="text-xs px-3 py-1 rounded-full font-medium" style={{background:'rgba(52,211,153,0.12)',color:'#34d399'}}>✓ All Approved</span>}
              </div>

              <div>
                {empGoals.map(goal=>(
                  <div key={goal.id} className="p-6" style={{borderBottom:'1px solid #1a2030'}}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm" style={{color:'#e2e8f0'}}>{goal.title}</p>
                          <StatusBadge status={goal.status}/>
                        </div>
                        {goal.description && <p className="text-xs mb-2" style={{color:'#475569'}}>{goal.description}</p>}
                        <div className="flex gap-4 text-xs" style={{color:'#334155'}}>
                          <span>🎯 {goal.thrust_area}</span>
                          <span>📊 {uomLabel[goal.uom_type]}</span>
                          {editing!==goal.id && <>
                            <span>Target: <strong style={{color:'#94a3b8'}}>{goal.target}</strong></span>
                            <span>Weight: <strong style={{color:'#94a3b8'}}>{goal.weightage}%</strong></span>
                          </>}
                        </div>

                        {editing===goal.id && (
                          <div className="mt-3 flex gap-3 items-end">
                            <div>
                              <label className="block text-xs mb-1" style={{color:'#475569'}}>Target</label>
                              <input type="number" value={editVals.target} onChange={e=>setEditVals(v=>({...v,target:e.target.value}))}
                                className="rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none" style={inputStyle}/>
                            </div>
                            <div>
                              <label className="block text-xs mb-1" style={{color:'#475569'}}>Weightage %</label>
                              <input type="number" value={editVals.weightage} onChange={e=>setEditVals(v=>({...v,weightage:e.target.value}))}
                                className="rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none" style={inputStyle}/>
                            </div>
                            <button onClick={()=>handleSaveEdit(goal.id)} disabled={loading===goal.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{background:'rgba(251,191,36,0.15)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.3)'}}>
                              Save
                            </button>
                            <button onClick={()=>setEditing(null)} className="text-xs" style={{color:'#475569'}}>Cancel</button>
                          </div>
                        )}

                        {goal.status==='submitted' && (
                          <input placeholder="Rejection note (optional)..."
                            value={rejectNote[goal.id]??''}
                            onChange={e=>setRejectNote(r=>({...r,[goal.id]:e.target.value}))}
                            className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                            style={inputStyle}/>
                        )}
                      </div>

                      {goal.status==='submitted' && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button onClick={()=>{setEditing(goal.id);setEditVals({target:String(goal.target),weightage:String(goal.weightage)})}}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{background:'#242d3f',color:'#94a3b8',border:'1px solid #2a3347'}}>
                            ✏️ Edit
                          </button>
                          <button onClick={()=>handleApprove(goal.id)} disabled={loading===goal.id}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-60"
                            style={{background:'rgba(52,211,153,0.12)',color:'#34d399',border:'1px solid rgba(52,211,153,0.2)'}}>
                            ✓ Approve
                          </button>
                          <button onClick={()=>handleReject(goal.id)} disabled={loading===goal.id}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-60"
                            style={{background:'rgba(248,113,113,0.12)',color:'#f87171',border:'1px solid rgba(248,113,113,0.2)'}}>
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function StatusBadge({status}:{status:string}) {
  const map:Record<string,{color:string;bg:string}> = {
    submitted:{color:'#fbbf24',bg:'rgba(251,191,36,0.12)'},
    approved:{color:'#34d399',bg:'rgba(52,211,153,0.12)'},
    rejected:{color:'#f87171',bg:'rgba(248,113,113,0.12)'},
  }
  const s = map[status]??{color:'#64748b',bg:'rgba(100,116,139,0.12)'}
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{background:s.bg,color:s.color}}>{status}</span>
}