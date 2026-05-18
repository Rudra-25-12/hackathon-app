import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SidebarClient from '@/components/SidebarClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, department')
    .eq('id', user.id)
    .single()

  let pendingCount = 0
  if (profile?.role === 'manager') {
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id')
      .eq('manager_id', user.id)

    const teamMemberIds = teamMembers?.map((member) => member.id) ?? ['none']

    const { count } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted')
      .in('employee_id', teamMemberIds)

    pendingCount = count ?? 0
  }

  const safeProfile = profile || { name: 'User', role: 'employee', department: 'General' }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <SidebarClient profile={safeProfile} pendingCount={pendingCount} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Extra top padding for mobile to avoid overlap with fixed top bar */}
        <div className="flex-1 overflow-auto pt-14 md:pt-0 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}