import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '../../lib/supabase-server'
import LichSuApp from './LichSuApp'

export const metadata: Metadata = { title: 'Lịch Sử Quẻ' }

export default async function LichSuPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: savedQues } = await supabase
    .from('saved_ques')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(300)

  return <LichSuApp savedQues={savedQues || []} user={user} />
}
