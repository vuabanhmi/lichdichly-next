'use client'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: 'transparent',
        border: '1px solid #5a4a2a',
        borderRadius: '8px',
        padding: '8px 20px',
        color: '#c9a030',
        fontSize: '13px',
        letterSpacing: '1px',
        cursor: 'pointer',
      }}
    >
      Đăng xuất
    </button>
  )
}
