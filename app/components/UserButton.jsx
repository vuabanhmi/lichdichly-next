'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import '../xem-que/dichly.css'

export default function UserButton({ user, loginOpen, setLoginOpen }) {
  const router = useRouter()
  const [internalLogin, setInternalLogin] = useState(false)
  const [showProfileSheet, setShowProfileSheet] = useState(false)

  const showLoginModal = loginOpen !== undefined ? loginOpen : internalLogin
  function openLogin() { loginOpen !== undefined ? setLoginOpen(true) : setInternalLogin(true) }
  function closeLogin() { loginOpen !== undefined ? setLoginOpen(false) : setInternalLogin(false) }

  const isLoggedIn = !!user
  const avatar = user?.user_metadata?.avatar_url || null
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || null
  const userEmail = user?.email || null

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setShowProfileSheet(false)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Fixed top-left */}
      <div style={{position:'fixed', top:10, left:12, zIndex:30}}>
        {!isLoggedIn ? (
          <button
            className="login-btn"
            style={{position:'static'}}
            onClick={openLogin}
            title="Đăng nhập"
          >
            👤
          </button>
        ) : (
          <button
            className="user-avatar"
            style={{position:'static'}}
            onClick={() => setShowProfileSheet(true)}
            title="Tài khoản"
          >
            {avatar
              ? <img src={avatar} width={32} height={32} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              : (userName?.[0]?.toUpperCase() || '?')}
          </button>
        )}
      </div>

      {/* Login modal */}
      {showLoginModal && (
        <div
          className="auth-overlay show"
          onClick={(e) => { if (e.target === e.currentTarget) closeLogin() }}
        >
          <div className="auth-modal">
            <button className="auth-modal-close" onClick={() => closeLogin()}>✕</button>
            <div className="auth-modal-icon">☯</div>
            <div className="auth-modal-title">ĐĂNG NHẬP</div>
            <div className="auth-modal-sub">Lưu lịch sử quẻ · ngày kỷ niệm<br/>và cài đặt cá nhân</div>
            <button className="auth-google-btn" onClick={signInWithGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Tiếp tục với Google
            </button>
            <div className="auth-terms">Bằng cách đăng nhập, bạn đồng ý với<br/>Điều khoản sử dụng của chúng tôi</div>
          </div>
        </div>
      )}

      {/* Profile bottom sheet */}
      {showProfileSheet && (
        <>
          <div className="profile-sheet-overlay show" onClick={() => setShowProfileSheet(false)} />
          <div className="profile-sheet show">
            <div className="profile-sheet-handle">
              <div className="profile-sheet-handle-bar" />
            </div>
            <div className="profile-sheet-user">
              <div className="profile-sheet-avatar">
                {avatar
                  ? <img src={avatar} width={44} height={44} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : (userName?.[0]?.toUpperCase() || '?')}
              </div>
              <div>
                <div className="profile-sheet-name">{userName || 'Người dùng'}</div>
                {userEmail && <div className="profile-sheet-email">{userEmail}</div>}
              </div>
            </div>
            <div style={{padding:'8px 0'}}>
              <Link href="/" className="profile-menu-item" onClick={() => setShowProfileSheet(false)}>
                <span className="profile-menu-icon">🏠</span>
                <div><div className="profile-menu-label">Trang chủ</div></div>
                <span className="profile-menu-arrow">›</span>
              </Link>
              <Link href="/lich-su" className="profile-menu-item" onClick={() => setShowProfileSheet(false)}>
                <span className="profile-menu-icon">📋</span>
                <div>
                  <div className="profile-menu-label">Lịch sử quẻ</div>
                  <div className="profile-menu-sub">Các quẻ đã xem và bốc</div>
                </div>
                <span className="profile-menu-arrow">›</span>
              </Link>
              <div className="profile-menu-divider" />
              <div className="profile-menu-item danger" onClick={handleSignOut}>
                <span className="profile-menu-icon">↩</span>
                <div className="profile-menu-label">Đăng xuất</div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
