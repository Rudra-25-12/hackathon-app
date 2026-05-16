import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AuditPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: profiles } = await supabase.from('profiles').select('id, name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Audit Log</h1>
      <p className="text-gray-500 text-sm mb-6">All changes made to goals and check-ins</p>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">When</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Who</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs?.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">No audit entries yet</td></tr>
              ) : (
                logs?.map(log => {
                  const person = profiles?.find(p => p.id === log.changed_by)
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{person?.name ?? 'System'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full capitalize">
                          {log.entity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{log.change_description}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}