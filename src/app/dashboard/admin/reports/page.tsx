import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: profiles } = await supabase.from('profiles').select('*')
  const { data: goals } = await supabase.from('goals').select('*')
  const { data: checkins } = await supabase.from('checkins').select('*')

  return <ReportsClient profiles={profiles ?? []} goals={goals ?? []} checkins={checkins ?? []} />
}