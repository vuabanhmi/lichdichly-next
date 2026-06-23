import type { Metadata } from 'next'
import { createServerSupabaseClient } from '../lib/supabase-server'

export const metadata: Metadata = {
  title: 'Lịch Âm Dương & Xem Quẻ',
}
import HomeCalendar from './components/HomeCalendar'

const FIXED_ANNIVERSARIES = [
  { name: 'Giỗ sư tổ Dịch Lý Sĩ Xuân Phong Nguyễn Văn Mì', lm: 3, ld: 10 },
  { name: 'Ngày giỗ ông Hoàng Mười', lm: 10, ld: 10 },
]

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userAnniversaries: { name: string; lm: number; ld: number }[] = []
  if (user) {
    const { data } = await supabase
      .from('anniversaries')
      .select('title, lunar_month, lunar_day')
      .eq('user_id', user.id)
    userAnniversaries = (data || []).map((e: { title: string; lunar_month: number; lunar_day: number }) => ({ name: e.title, lm: e.lunar_month, ld: e.lunar_day }))
  }

  const anniversaries = [...FIXED_ANNIVERSARIES, ...userAnniversaries]
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || null
  const avatar = user?.user_metadata?.avatar_url || null
  const email = user?.email || null

  return (
    <div>
      <HomeCalendar
        anniversaries={anniversaries}
        isLoggedIn={!!user}
        userName={name}
        userEmail={email}
        avatar={avatar}
      />
    </div>
  )
}
