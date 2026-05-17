'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EscalationLogClient({logs,profiles,activeEscalations,activeQuarter}:{
  logs:any[];profiles:any[];activeEscalations:any;activeQuarter:string
}) {
  const [logging,setLogging] = useState<string|null>(null)
  const supabase = createClient()
  const router = useRouter()

  const logEscalation = async (type:string, empId:string, desc:string) => {
    setLogging(empId+type)
    await supabase.from('escalation_logs').insert({
      escalation_type: type,
      employee_id: empId,
      description: desc,
    })
    setLogging(null)
    router.refresh()
  }

  const resolveLog = async (id:string) => {
    await supabase.from('escalation_logs').update({resolved:true}).eq('id',id)
    router.refresh()
  }

  const getPerson = (id:string) => profiles.find(p=>p.id===id)

  const cards = [
    {
      type:'no_goals',
      title:'No goals submitted',
      icon:'🚨',
      people: activeEscalations.noGoals,
      color:'#f87171',
      bg:'rgba(248,113,113,0.06)',
      border:'rgba(248,113,113,0.2)',
      desc:(name:string)=>`${name} has not submitted goals for this cycle`
    },
    {
      type:'pending_approval',
      title:'Awaiting approval',
      icon:'⏳',
      people: activeEscalations.pendingApproval,
      color:'#fbbf24',
      bg:'rgba(251,191,36,0.06)',
      border:'rgba(251,191,36,0.2)',
      desc:(name:string)=>`${name}'s goals are pending manager approval`
    },
    {
      type:'no_checkins',
      title:'No check-ins logged',
      icon:'📋',
      people: activeEscalations.noCheckins,
      color:'#fb923c',
      bg:'rgba(251,146,60,0.06)',
      border:'rgba(251,146,60,0.2)',
      desc:(name:string)=>`${name} has not completed ${activeQuarter} check-in`
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Admin</p>
        <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Escalation Log</h1>
        <p className="text-sm mt-1" style={{color:'#475569'}}>Track and resolve escalations across the organisation</p>
      </div>

      {/* Active escalations */}
      <div className="space-y-4 mb-8">
        {cards.map(card=>(
          <div key={card.type} className="rounded-2xl p-6"
            style={{background:card.bg,border:`1px solid ${card.border}`}}>
            <div className="flex items-center gap-2 mb-4">
              <span>{card.icon}</span>
              <h3 className="font-bold" style={{color:card.color}}>{card.title}</h3>
              {card.people.length>0&&(
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{background:card.bg,color:card.color,border:`1px solid ${card.border}`}}>
                  {card.people.length}
                </span>
              )}
            </div>
            {card.people.length===0?(
              <p className="text-sm font-medium" style={{color:'#34d399'}}>No active escalations ✓</p>
            ):(
              <div className="space-y-2">
                {card.people.map((p:any)=>(
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{background:'#1e2433',border:'1px solid #2a3347'}}>
                    <div>
                      <p className="text-sm font-semibold" style={{color:'#e2e8f0'}}>{p.name}</p>
                      <p className="text-xs" style={{color:'#475569'}}>{p.department}</p>
                    </div>
                    <button
                      onClick={()=>logEscalation(card.type, p.id, card.desc(p.name))}
                      disabled={logging===p.id+card.type}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-50"
                      style={{background:card.bg,color:card.color,border:`1px solid ${card.border}`}}>
                      {logging===p.id+card.type?'Logging...':'Log Escalation'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Escalation history */}
      <div className="rounded-2xl overflow-hidden" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <div className="px-6 py-4" style={{borderBottom:'1px solid #2a3347'}}>
          <p className="font-bold" style={{color:'#f1f5f9'}}>Escalation History</p>
        </div>
        {logs.length===0?(
          <div className="text-center py-12">
            <p className="text-sm" style={{color:'#334155'}}>No escalations logged yet</p>
          </div>
        ):(
          <table className="w-full text-sm">
            <thead>
              <tr style={{borderBottom:'1px solid #2a3347'}}>
                {['When','Employee','Type','Description','Status','Action'].map(h=>(
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{color:'#334155'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log=>{
                const person = getPerson(log.employee_id)
                return (
                  <tr key={log.id} style={{borderBottom:'1px solid #1a2030'}}>
                    <td className="px-6 py-4 text-xs whitespace-nowrap" style={{color:'#475569'}}>
                      {new Date(log.created_at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{color:'#e2e8f0'}}>{person?.name??'—'}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{background:'rgba(251,191,36,0.12)',color:'#fbbf24'}}>
                        {log.escalation_type?.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs" style={{color:'#64748b',maxWidth:200}}>{log.description}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{background:log.resolved?'rgba(52,211,153,0.12)':'rgba(248,113,113,0.12)',
                          color:log.resolved?'#34d399':'#f87171'}}>
                        {log.resolved?'Resolved':'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!log.resolved&&(
                        <button onClick={()=>resolveLog(log.id)}
                          className="text-xs px-3 py-1 rounded-lg font-medium"
                          style={{background:'rgba(52,211,153,0.1)',color:'#34d399',border:'1px solid rgba(52,211,153,0.2)'}}>
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}