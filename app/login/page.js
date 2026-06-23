'use client'
import { createClient } from '../../lib/supabase'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div style={{
      minHeight:'100vh',background:'#0c0c14',
      display:'flex',alignItems:'center',justifyContent:'center',
      flexDirection:'column',gap:'24px',fontFamily:'system-ui'
    }}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'8px'}}>☯</div>
        <h1 style={{color:'#c9a030',fontSize:'28px',letterSpacing:'4px',margin:0}}>DỊCH LÝ VN</h1>
        <p style={{color:'#5a4a2a',fontSize:'13px',letterSpacing:'2px',marginTop:'8px'}}>LỊCH DỊCH LÝ VIỆT NAM</p>
      </div>
      <button onClick={signInWithGoogle} style={{
        background:'#1e1c2e',
        border:'1px solid #3a3650',
        borderRadius:'12px',
        padding:'13px 28px',
        fontSize:'14px',
        cursor:'pointer',
        display:'flex',alignItems:'center',gap:'12px',
        fontWeight:'500',
        color:'#e8e0d0',
        letterSpacing:'0.5px',
        transition:'border-color 0.2s,background 0.2s',
      }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='#8a6a10';e.currentTarget.style.background='#252238'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='#3a3650';e.currentTarget.style.background='#1e1c2e'}}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.96 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Đăng nhập bằng Google
      </button>
    </div>
  )
}
