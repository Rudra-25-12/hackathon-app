'use client'
import { useState } from 'react'
import AnimatedStatCards from '@/components/AnimatedStatCards'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa']

const darkTooltip = {
  contentStyle: { background: '#1e2433', border: '1px solid #2a3347', borderRadius: 8, color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8' },
}

export default function AdminCharts({ deptStats, quarterStats, escalations, managerStats, summary, allProfiles, allGoals, allCheckins, thrustStats }: {
  deptStats: any[], quarterStats: any[], escalations: any,
  managerStats: any[], summary: any, allProfiles: any[], allGoals: any[], allCheckins: any[], thrustStats: any[]
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'escalations' | 'employees'>('overview')

  const goalStatusData = [
    { name: 'Approved', value: allGoals.filter(g => g.status === 'approved').length },
    { name: 'Pending', value: allGoals.filter(g => g.status === 'submitted').length },
    { name: 'Draft', value: allGoals.filter(g => g.status === 'draft').length },
    { name: 'Rejected', value: allGoals.filter(g => g.status === 'rejected').length },
  ].filter(d => d.value > 0)

  const employees = allProfiles.filter(p => p.role === 'employee')
  const totalEscalations = escalations.noGoals.length + escalations.pendingApproval.length + escalations.noCheckins.length

  const tabs = ['overview', 'charts', 'escalations', 'employees'] as const

  return (
    <>
      <style>{`
        .tab-btn { transition: all 0.15s ease; }
        .dark-table tr:hover td { background: #242d3f; }
        .dark-table td, .dark-table th { transition: background 0.15s; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: '#fbbf24' }}>Admin Panel</p>
          <h1 className="text-3xl font-black"
            style={{ color: '#f1f5f9', background: 'linear-gradient(135deg,#f1f5f9,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Overview
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm" style={{ color: '#475569' }}>Active Quarter:</span>
            <span className="text-sm font-bold px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>
              {summary.activeQuarter}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: summary.goalSettingOpen ? 'rgba(52,211,153,0.12)' : 'rgba(100,116,139,0.12)',
                color: summary.goalSettingOpen ? '#34d399' : '#64748b'
              }}>
              Goal Setting {summary.goalSettingOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/dashboard/admin/reports"
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
            ⬇ Export CSV
          </a>
          <a href="/dashboard/admin/cycle"
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
            ⚙ Cycle
          </a>
        </div>
      </div>

      {/* Stat cards */}
      <AnimatedStatCards cards={[
        { label: 'Employees', value: summary.employees, color: '#60a5fa', sub: 'registered' },
        { label: 'Total Goals', value: summary.totalGoals, color: '#94a3b8', sub: 'across all employees' },
        { label: 'Approved', value: summary.approvedGoals, color: '#34d399', sub: 'goals locked in' },
        { label: 'Pending', value: summary.pendingGoals, color: summary.pendingGoals > 0 ? '#fbbf24' : '#34d399', sub: summary.pendingGoals > 0 ? '⚠ needs action' : '✓ all clear' },
      ]} />

      {/* Escalation banner */}
      {totalEscalations > 0 && (
        <div className="rounded-2xl p-4 mb-6"
          style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#f87171' }}>⚠ Escalation Alerts</p>
          <div className="flex flex-wrap gap-2">
            {escalations.noGoals.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                {escalations.noGoals.length} employees with no goals
              </span>
            )}
            {escalations.pendingApproval.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>
                {escalations.pendingApproval.length} awaiting approval
              </span>
            )}
            {escalations.noCheckins.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>
                {escalations.noCheckins.length} with no check-ins
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="tab-btn px-4 py-1.5 rounded-lg text-sm font-medium capitalize"
            style={{
              background: activeTab === tab ? '#2a3347' : 'transparent',
              color: activeTab === tab ? '#fbbf24' : '#475569',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #2a3347' }}>
            <h2 className="font-bold" style={{ color: '#f1f5f9' }}>Employee Goal Status</h2>
            <div className="flex gap-3">
              <a href="/dashboard/admin/reports" className="text-xs font-medium"
                style={{ color: '#60a5fa' }}>Reports →</a>
              <a href="/dashboard/admin/audit" className="text-xs font-medium"
                style={{ color: '#475569' }}>Audit Log →</a>
            </div>
          </div>
          <table className="w-full text-sm dark-table">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a3347' }}>
                {['Employee', 'Department', 'Manager', 'Goals', 'Approved', 'Check-ins', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#334155' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const empGoals = allGoals.filter(g => g.employee_id === emp.id)
                const approv = empGoals.filter(g => g.status === 'approved').length
                const checkins = allCheckins.filter(c => empGoals.some(g => g.id === c.goal_id)).length
                const manager = allProfiles.find(p => p.id === emp.manager_id)
                const done = empGoals.length > 0 && approv === empGoals.length
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #1a2030' }}>
                    <td className="px-6 py-4 font-semibold" style={{ color: '#e2e8f0' }}>{emp.name}</td>
                    <td className="px-6 py-4" style={{ color: '#475569' }}>{emp.department}</td>
                    <td className="px-6 py-4" style={{ color: '#475569' }}>{manager?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-center" style={{ color: '#94a3b8' }}>{empGoals.length}</td>
                    <td className="px-6 py-4 text-center font-bold" style={{ color: '#34d399' }}>{approv}</td>
                    <td className="px-6 py-4 text-center" style={{ color: '#60a5fa' }}>{checkins}</td>
                    <td className="px-6 py-4">
                      {empGoals.length === 0
                        ? <Badge label="No Goals" color="#64748b" bg="rgba(100,116,139,0.12)" />
                        : done
                        ? <Badge label="✓ Complete" color="#34d399" bg="rgba(52,211,153,0.12)" />
                        : <Badge label="Pending" color="#fbbf24" bg="rgba(251,191,36,0.12)" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Charts tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
              <h3 className="font-bold mb-4" style={{color:'#f1f5f9'}}>Goal status distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={goalStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({name,value})=>`${name}: ${value}`}>
                    {goalStatusData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>) }
                  </Pie>
                  <Tooltip {...darkTooltip}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
              <h3 className="font-bold mb-4" style={{color:'#f1f5f9'}}>Goals by department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3347"/>
                  <XAxis dataKey="dept" tick={{fill:'#475569',fontSize:11}}/>
                  <YAxis tick={{fill:'#475569',fontSize:11}}/>
                  <Tooltip {...darkTooltip}/>
                  <Legend wrapperStyle={{color:'#94a3b8'}}/>
                  <Bar dataKey="approved" name="Approved" fill="#34d399" radius={[4,4,0,0]}/>
                  <Bar dataKey="submitted" name="Pending" fill="#fbbf24" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QoQ trends */}
          <div className="rounded-2xl p-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
            <h3 className="font-bold mb-1" style={{color:'#f1f5f9'}}>Quarter-on-quarter check-in progress</h3>
            <p className="text-xs mb-4" style={{color:'#475569'}}>Achievement status across all quarters</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={quarterStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3347"/>
                <XAxis dataKey="quarter" tick={{fill:'#475569'}}/>
                <YAxis tick={{fill:'#475569'}}/>
                <Tooltip {...darkTooltip}/>
                <Legend wrapperStyle={{color:'#94a3b8'}}/>
                <Bar dataKey="completed" name="Completed" fill="#34d399" radius={[4,4,0,0]}/>
                <Bar dataKey="onTrack" name="On Track" fill="#60a5fa" radius={[4,4,0,0]}/>
                <Bar dataKey="notStarted" name="Not Started" fill="#2a3347" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Goal distribution by thrust area */}
          <div className="rounded-2xl p-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
            <h3 className="font-bold mb-1" style={{color:'#f1f5f9'}}>Goal distribution by thrust area</h3>
            <p className="text-xs mb-4" style={{color:'#475569'}}>Breakdown of all goals across strategic areas</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={thrustStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3347"/>
                <XAxis type="number" tick={{fill:'#475569',fontSize:11}}/>
                <YAxis type="category" dataKey="area" tick={{fill:'#94a3b8',fontSize:11}} width={140}/>
                <Tooltip {...darkTooltip}/>
                <Bar dataKey="count" name="Goals" fill="#a78bfa" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Manager effectiveness */}
          {managerStats.length>0&&(
            <div className="rounded-2xl p-6" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
              <h3 className="font-bold mb-4" style={{color:'#f1f5f9'}}>Manager effectiveness</h3>
              <div className="space-y-3">
                {managerStats.map((m,i)=>(
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{background:'#242d3f'}}>
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-semibold" style={{color:'#e2e8f0'}}>{m.name}</p>
                      <p className="text-xs" style={{color:'#475569'}}>{m.teamSize} reports</p>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs mb-1" style={{color:'#475569'}}>Approved</p>
                        <p className="font-bold" style={{color:'#34d399'}}>{m.approved}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{color:'#475569'}}>Pending</p>
                        <p className="font-bold" style={{color:m.pending>0?'#fbbf24':'#475569'}}>{m.pending}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{color:'#475569'}}>Comments</p>
                        <p className="font-bold" style={{color:'#60a5fa'}}>{m.checkinsDone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Escalations tab */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          {[
            { title: 'No Goals Submitted', icon: '🚨', people: escalations.noGoals, color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)', empty: 'All employees have submitted goals ✓' },
            { title: 'Awaiting Manager Approval', icon: '⏳', people: escalations.pendingApproval, color: '#fbbf24', bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)', empty: 'No pending approvals ✓' },
            { title: 'No Check-ins Yet', icon: '📋', people: escalations.noCheckins, color: '#fb923c', bg: 'rgba(251,146,60,0.06)', border: 'rgba(251,146,60,0.2)', empty: 'All employees have started check-ins ✓' },
          ].map(card => (
            <div key={card.title} className="rounded-2xl p-6"
              style={{ background: card.bg, border: `1px solid ${card.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <span>{card.icon}</span>
                <h3 className="font-bold" style={{ color: card.color }}>{card.title}</h3>
                {card.people.length > 0 && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: card.bg, color: card.color, border: `1px solid ${card.border}` }}>
                    {card.people.length}
                  </span>
                )}
              </div>
              {card.people.length === 0
                ? <p className="text-sm font-medium" style={{ color: '#34d399' }}>{card.empty}</p>
                : (
                  <div className="flex flex-wrap gap-2">
                    {card.people.map((p: any) => (
                      <span key={p.id} className="text-xs px-3 py-1 rounded-full"
                        style={{ background: '#1e2433', color: '#94a3b8', border: '1px solid #2a3347' }}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Employees tab */}
      {activeTab === 'employees' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
          <table className="w-full text-sm dark-table">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a3347' }}>
                {['Name', 'Role', 'Department', 'Manager', 'Goals', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#334155' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProfiles.map(p => {
                const manager = allProfiles.find(m => m.id === p.manager_id)
                const goals = allGoals.filter(g => g.employee_id === p.id)
                const roleColors: Record<string, { color: string; bg: string }> = {
                  admin:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
                  manager:  { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
                  employee: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
                }
                const rc = roleColors[p.role] ?? roleColors.employee
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1a2030' }}>
                    <td className="px-6 py-4 font-semibold" style={{ color: '#e2e8f0' }}>{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ background: rc.bg, color: rc.color }}>{p.role}</span>
                    </td>
                    <td className="px-6 py-4" style={{ color: '#475569' }}>{p.department ?? '—'}</td>
                    <td className="px-6 py-4" style={{ color: '#475569' }}>{manager?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-center" style={{ color: '#94a3b8' }}>{goals.length}</td>
                    <td className="px-6 py-4">
                      {goals.length === 0
                        ? <Badge label="No Goals" color="#64748b" bg="rgba(100,116,139,0.12)" />
                        : goals.every(g => g.status === 'approved')
                        ? <Badge label="✓ Done" color="#34d399" bg="rgba(52,211,153,0.12)" />
                        : <Badge label="In Progress" color="#fbbf24" bg="rgba(251,191,36,0.12)" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${label === 'Pending' ? 'pending-badge' : ''}`}
      style={{ background: bg, color }}>
      {label}
    </span>
  )
}