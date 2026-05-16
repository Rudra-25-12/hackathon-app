'use client'
import { useState } from 'react'

function computeScore(uom_type: string, target: number, actual: number): number {
  if (!actual || !target) return 0
  switch (uom_type) {
    case 'numeric_min': return Math.min((actual / target) * 100, 100)
    case 'numeric_max': return Math.min((target / actual) * 100, 100)
    case 'zero': return actual === 0 ? 100 : 0
    case 'timeline': return actual <= target ? 100 : Math.max(0, 100 - ((actual - target) / target) * 100)
    default: return 0
  }
}

export default function ReportsClient({ profiles, goals, checkins }: {
  profiles: any[], goals: any[], checkins: any[]
}) {
  const [quarterFilter, setQuarterFilter] = useState('all')

  const employees = profiles.filter(p => p.role === 'employee')

  // Build report rows
  const rows = goals.map(goal => {
    const emp = profiles.find(p => p.id === goal.employee_id)
    const manager = profiles.find(p => p.id === emp?.manager_id)
    const goalCheckins = checkins.filter(c => c.goal_id === goal.id)

    return goalCheckins.length > 0
      ? goalCheckins.map(c => ({
          employee: emp?.name ?? '—',
          department: emp?.department ?? '—',
          manager: manager?.name ?? '—',
          goal_title: goal.title,
          thrust_area: goal.thrust_area,
          uom_type: goal.uom_type,
          target: goal.target,
          weightage: goal.weightage,
          status: goal.status,
          quarter: c.quarter,
          actual: c.actual_achievement,
          progress_status: c.progress_status,
          score: computeScore(goal.uom_type, goal.target, c.actual_achievement).toFixed(0) + '%'
        }))
      : [{
          employee: emp?.name ?? '—',
          department: emp?.department ?? '—',
          manager: manager?.name ?? '—',
          goal_title: goal.title,
          thrust_area: goal.thrust_area,
          uom_type: goal.uom_type,
          target: goal.target,
          weightage: goal.weightage,
          status: goal.status,
          quarter: '—',
          actual: '—',
          progress_status: '—',
          score: '—'
        }]
  }).flat()

  const filtered = quarterFilter === 'all' ? rows : rows.filter(r => r.quarter === quarterFilter)

  const exportCSV = () => {
    const headers = ['Employee', 'Department', 'Manager', 'Goal Title', 'Thrust Area',
      'UoM Type', 'Target', 'Weightage %', 'Goal Status', 'Quarter', 'Actual', 'Progress Status', 'Score']
    const csvRows = filtered.map(r => [
      r.employee, r.department, r.manager, r.goal_title, r.thrust_area,
      r.uom_type, r.target, r.weightage, r.status, r.quarter, r.actual, r.progress_status, r.score
    ])
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `achievement_report_${quarterFilter}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Achievement Report</h1>
          <p className="text-gray-500 text-sm mt-1">Planned vs actual for all employees</p>
        </div>
        <button onClick={exportCSV}
          className="bg-green-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-green-700 transition font-medium">
          ⬇ Export CSV
        </button>
      </div>

      {/* Quarter filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'Q1', 'Q2', 'Q3', 'Q4'].map(q => (
          <button key={q} onClick={() => setQuarterFilter(q)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${quarterFilter === q ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {q === 'all' ? 'All Quarters' : q}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Employee', 'Department', 'Goal Title', 'Thrust Area', 'Target', 'Weight', 'Quarter', 'Actual', 'Score', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">No data available</td></tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.employee}</td>
                    <td className="px-4 py-3 text-gray-500">{row.department}</td>
                    <td className="px-4 py-3 text-gray-700">{row.goal_title}</td>
                    <td className="px-4 py-3 text-gray-500">{row.thrust_area}</td>
                    <td className="px-4 py-3 text-gray-700">{row.target}</td>
                    <td className="px-4 py-3 text-gray-700">{row.weightage}%</td>
                    <td className="px-4 py-3 text-gray-500">{row.quarter}</td>
                    <td className="px-4 py-3 font-medium text-blue-700">{row.actual}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{row.score}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full capitalize font-medium ${
                        row.progress_status === 'completed' ? 'bg-green-100 text-green-700' :
                        row.progress_status === 'on_track' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'}`}>
                        {row.progress_status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}