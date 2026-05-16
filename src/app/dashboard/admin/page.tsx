import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

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

  const employees = allProfiles?.filter(p => p.role === 'employee') ?? []
  const managers = allProfiles?.filter(p => p.role === 'manager') ?? []

  const totalGoals = allGoals?.length ?? 0
  const approvedGoals = allGoals?.filter(g => g.status === 'approved').length ?? 0
  const pendingGoals = allGoals?.filter(g => g.status === 'submitted').length ?? 0
  const totalCheckins = allCheckins?.length ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Overview</h1>
      <p className="text-gray-500 text-sm mb-8">Organisation-wide goal tracking status</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Employees" value={employees.length} color="blue" />
        <StatCard label="Total Goals" value={totalGoals} color="gray" />
        <StatCard label="Approved Goals" value={approvedGoals} color="green" />
        <StatCard label="Pending Approval" value={pendingGoals} color="yellow" />
      </div>

      {/* Completion table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Employee Goal Status</h2>
          <div className="flex gap-2">
            <a href="/dashboard/admin/reports"
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              📊 Reports & Export
            </a>
            <a href="/dashboard/admin/audit"
              className="bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition">
              📋 Audit Log
            </a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Department</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Manager</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">Goals</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">Approved</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">Check-ins</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map(emp => {
                const empGoals = allGoals?.filter(g => g.employee_id === emp.id) ?? []
                const approved = empGoals.filter(g => g.status === 'approved').length
                const empCheckins = allCheckins?.filter(c =>
                  empGoals.some(g => g.id === c.goal_id)
                ).length ?? 0
                const manager = allProfiles?.find(p => p.id === emp.manager_id)
                const fullyApproved = empGoals.length > 0 && approved === empGoals.length

                return (
                  <tr key={emp.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-500">{emp.department}</td>
                    <td className="px-6 py-4 text-gray-500">{manager?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{empGoals.length}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-medium">{approved}</td>
                    <td className="px-6 py-4 text-center text-blue-600">{empCheckins}</td>
                    <td className="px-6 py-4 text-center">
                      {empGoals.length === 0
                        ? <Badge label="No Goals" color="gray" />
                        : fullyApproved
                        ? <Badge label="✓ Complete" color="green" />
                        : <Badge label="Pending" color="yellow" />
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600', green: 'text-green-600',
    yellow: 'text-yellow-600', gray: 'text-gray-700'
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray: 'bg-gray-100 text-gray-500'
  }
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[color]}`}>{label}</span>
  )
}