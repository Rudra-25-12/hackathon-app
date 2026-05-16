import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: profiles } = await supabase.from('profiles').select('*')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Users</h1>
      <p className="text-gray-500 text-sm mb-6">All users in the organisation</p>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Role</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Department</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Reports To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles?.map(p => {
              const manager = profiles.find(m => m.id === p.manager_id)
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                      p.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      p.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.department ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{manager?.name ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}