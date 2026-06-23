'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'
import '../xem-que/dichly.css'

// ─── Ho Ngoc Duc Algorithm ─────────────────────────────────────────────────────
function INT(d) { return Math.trunc(d) }
function pad(n) { return String(n).padStart(2, '0') }
function jdFromDate(dd, mm, yy) {
  var a=INT((14-mm)/12),y=yy+4800-a,m=mm+12*a-3
  var jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045
  if(jd<2299161)jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083
  return jd
}
function newMoon(k) {
  var T=k/1236.85,T2=T*T,T3=T2*T,dr=Math.PI/180
  var Jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3+0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr)
  var M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3
  var Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3
  var F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3
  var C1=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*dr*M)
    -0.4068*Math.sin(Mpr*dr)+0.0161*Math.sin(dr*2*Mpr)-0.0004*Math.sin(dr*3*Mpr)
    +0.0104*Math.sin(dr*2*F)-0.0051*Math.sin(dr*(M+Mpr))-0.0074*Math.sin(dr*(M-Mpr))
    +0.0004*Math.sin(dr*(2*F+M))-0.0004*Math.sin(dr*(2*F-M))-0.0006*Math.sin(dr*(2*F+Mpr))
    +0.0010*Math.sin(dr*(2*F-Mpr))+0.0005*Math.sin(dr*(M+2*Mpr))
  var deltat=T>=-11?(-0.000278+0.000265*T+0.000262*T2):(0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3)
  return INT(Jd1+C1-deltat+0.5+7/24)
}
function sunLongitude(jdn) {
  var T=(jdn-2451545.5-7/24)/36525,T2=T*T,dr=Math.PI/180
  var M=357.5291+35999.0503*T-0.0001559*T2-0.00000048*T*T2
  var L0=280.46646+36000.76983*T+0.0003032*T2
  var DL=(1.9146-0.004817*T-0.000014*T2)*Math.sin(dr*M)+(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.00029*Math.sin(dr*3*M)
  var L=(L0+DL)%360; if(L<0)L+=360
  return INT(L/30)
}
function getLeapMonthOffset(a11) {
  var k=INT((a11-2415021.076998695)/29.530588853+0.5)
  var last=0,i=1,arc=sunLongitude(newMoon(k+i))
  while(arc!==last&&i<14){last=arc;i++;arc=sunLongitude(newMoon(k+i))}
  return i-1
}
function getLunarYear11(yy) {
  var off=jdFromDate(31,12,yy)-2415021.076998695
  var k=INT(off/29.530588853)
  var nm=newMoon(k)
  if(sunLongitude(nm)>=9)nm=newMoon(k-1)
  return nm
}
function toLunar(gY, gM, gD) {
  var dayNumber=jdFromDate(gD,gM,gY)
  var k=INT((dayNumber-2415021.076998695)/29.530588853)
  var monthStart=newMoon(k+1)
  if(monthStart>dayNumber)monthStart=newMoon(k)
  var a11=getLunarYear11(gM>=11?gY:gY-1)
  var b11=getLunarYear11(gM>=11?gY+1:gY)
  var lunarMonth=INT((monthStart-a11)/29)+11
  if(b11-a11>365){var leapOff=getLeapMonthOffset(a11);if(lunarMonth>=leapOff)lunarMonth--}
  if(lunarMonth>12)lunarMonth-=12
  if(lunarMonth<1)lunarMonth+=12
  var lunarDay=dayNumber-monthStart+1
  var lunarYear=(lunarMonth>=11&&gM<3)?gY-1:gY
  var canArr=['Canh','Tân','Nhâm','Quý','Giáp','Ất','Bính','Đinh','Mậu','Kỷ']
  var chiArr=['Thân','Dậu','Tuất','Hợi','Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi']
  var yn=canArr[lunarYear%10]+' '+chiArr[lunarYear%12]
  var yc=((lunarYear+9)%12)||12
  return {ld:lunarDay,lm:lunarMonth,ly:lunarYear,yc,yn}
}
function getHChi(h) { if(h===23||h===0)return 1; return Math.floor((h+1)/2)+1 }
function l2t(a,b,c) { for(let t=1;t<=8;t++){const[x,y,z]=TL[t];if(x===a&&y===b&&z===c)return t} return 1 }

// ─── Data ─────────────────────────────────────────────────────────────────────
const TL={1:[1,1,1],2:[1,1,0],3:[1,0,1],4:[1,0,0],5:[0,1,1],6:[0,1,0],7:[0,0,1],8:[0,0,0]}
const HN=[
  ['Thuần Kiền','Thiên Trạch Lý','Thiên Hỏa Đồng Nhân','Thiên Lôi Vô Vọng','Thiên Phong Cấu','Thiên Thủy Tụng','Thiên Sơn Độn','Thiên Địa Bĩ'],
  ['Trạch Thiên Quải','Thuần Đoài','Trạch Hỏa Cách','Trạch Lôi Tùy','Trạch Phong Đại Quá','Trạch Thủy Khốn','Trạch Sơn Hàm','Trạch Địa Tụy'],
  ['Hỏa Thiên Đại Hữu','Hỏa Trạch Khuể','Thuần Ly','Hỏa Lôi Phệ Hạp','Hỏa Phong Đỉnh','Hỏa Thủy Vị Tế','Hỏa Sơn Lữ','Hỏa Địa Tấn'],
  ['Lôi Thiên Đại Tráng','Lôi Trạch Quy Muội','Lôi Hỏa Phong','Thuần Chấn','Lôi Phong Hằng','Lôi Thủy Giải','Lôi Sơn Tiểu Quá','Lôi Địa Dự'],
  ['Phong Thiên Tiểu Súc','Phong Trạch Trung Phu','Phong Hỏa Gia Nhân','Phong Lôi Ích','Thuần Tốn','Phong Thủy Hoán','Phong Sơn Tiệm','Phong Địa Quan'],
  ['Thủy Thiên Nhu','Thủy Trạch Tiết','Thủy Hỏa Ký Tế','Thủy Lôi Truân','Thủy Phong Tĩnh','Thuần Khảm','Thủy Sơn Kiển','Thủy Địa Tỷ'],
  ['Sơn Thiên Đại Súc','Sơn Trạch Tổn','Sơn Hỏa Bí','Sơn Lôi Di','Sơn Phong Cổ','Sơn Thủy Mông','Thuần Cấn','Sơn Địa Bác'],
  ['Địa Thiên Thái','Địa Trạch Lâm','Địa Hỏa Minh Sản','Địa Lôi Phục','Địa Phong Thăng','Địa Thủy Sư','Địa Sơn Khiêm','Thuần Khôn'],
]
const GIO12=[
  {chi:'Tý',h:23,label:'23–1h'},{chi:'Sửu',h:1,label:'1–3h'},
  {chi:'Dần',h:3,label:'3–5h'},{chi:'Mão',h:5,label:'5–7h'},
  {chi:'Thìn',h:7,label:'7–9h'},{chi:'Tỵ',h:9,label:'9–11h'},
  {chi:'Ngọ',h:11,label:'11–13h'},{chi:'Mùi',h:13,label:'13–15h'},
  {chi:'Thân',h:15,label:'15–17h'},{chi:'Dậu',h:17,label:'17–19h'},
  {chi:'Tuất',h:19,label:'19–21h'},{chi:'Hợi',h:21,label:'21–23h'},
]
const CHI_NAMES = ['','Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi']
const MN = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
            'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

function calcQue(Y, M, D, h) {
  const lu = toLunar(Y, M, D)
  if (!lu) return '—'
  const {yc, lm, ld} = lu
  const hc = getHChi(h)
  const s3 = yc + lm + ld
  const s4 = s3 + hc
  let up = s3 % 8; if (!up) up = 8
  let lo = s4 % 8; if (!lo) lo = 8
  return HN[up-1][lo-1]
}

function getVNNow() {
  const n = new Date()
  const v = new Date(n.toLocaleString('en-US', {timeZone:'Asia/Ho_Chi_Minh'}))
  return {Y:v.getFullYear(), M:v.getMonth()+1, D:v.getDate(), h:v.getHours()}
}

function autoThemeVal() { const h = new Date().getHours(); return h >= 6 && h < 18 ? 'light' : 'dark' }
function themeIcon(m) { return m === 'auto' ? '⏰' : m === 'light' ? '☀' : '☽' }

// ─── Main component ────────────────────────────────────────────────────────────
/** @param {{ anniversaries: {name:string,lm:number,ld:number}[], isLoggedIn?: boolean, userName?: string|null, userEmail?: string|null, avatar?: string|null }} props */
export default function HomeCalendar({ anniversaries = [], isLoggedIn = false, userName = null, userEmail = null, avatar = null }) {
  const router = useRouter()

  // Live clock
  const [clock, setClock] = useState('--:--:--')
  const [gioChi, setGioChi] = useState('——')
  const [lunarDisp, setLunarDisp] = useState('')

  // Calendar
  const [year, setYear] = useState(() => getVNNow().Y)
  const [month, setMonth] = useState(() => getVNNow().M)
  const [selDay, setSelDay] = useState(() => getVNNow().D)
  const todayVN = getVNNow()

  // Selected hour (for hexagram)
  const [selHour, setSelHour] = useState(() => getVNNow().h)

  // Theme
  const [themeMode, setThemeMode] = useState('auto')

  // Auth UI
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showProfileSheet, setShowProfileSheet] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme-mode') || 'auto'
    setThemeMode(saved)
    document.documentElement.setAttribute('data-theme', saved === 'auto' ? autoThemeVal() : saved)

    function tick() {
      const now = new Date(new Date().toLocaleString('en-US', {timeZone:'Asia/Ho_Chi_Minh'}))
      const Y = now.getFullYear(), M = now.getMonth()+1, D = now.getDate(), h = now.getHours()
      setClock(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`)
      setGioChi(`Giờ ${CHI_NAMES[getHChi(h)]}`)
      const lu = toLunar(Y, M, D)
      if (lu) setLunarDisp(`${lu.ld} tháng ${lu.lm} năm ${lu.yn}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function applyTheme(mode) {
    const t = mode === 'auto' ? autoThemeVal() : mode
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('theme-mode', mode)
    setThemeMode(mode)
  }
  function toggleTheme() {
    applyTheme(themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto')
  }

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

  function navMonth(dir) {
    let m = month + dir, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setMonth(m); setYear(y)
  }

  function goNow() {
    const vn = getVNNow()
    setYear(vn.Y); setMonth(vn.M); setSelDay(vn.D); setSelHour(vn.h)
  }

  // Calendar grid
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  // 12 giờ bar
  const gio12 = GIO12.map(g => {
    const isNow = year === todayVN.Y && month === todayVN.M && selDay === todayVN.D && getHChi(g.h) === getHChi(todayVN.h)
    const isSelected = getHChi(g.h) === getHChi(selHour)
    return { ...g, queName: selDay ? calcQue(year, month, selDay, g.h) : '—', isNow, isSelected }
  })

  const selLunar = selDay ? toLunar(year, month, selDay) : null
  const selQue = selDay && selHour !== null ? calcQue(year, month, selDay, selHour) : null
  const selGioChi = selHour !== null ? CHI_NAMES[getHChi(selHour)] : null

  const isNotToday = year !== todayVN.Y || month !== todayVN.M || selDay !== todayVN.D

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',color:'var(--text)',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* ── HEADER ── */}
      <div className="hdr" style={{position:'relative'}}>
        {/* Top-left: login / avatar */}
        {!isLoggedIn ? (
          <button className="login-btn" onClick={() => setShowLoginModal(true)} title="Đăng nhập">
            👤
          </button>
        ) : (
          <button className="user-avatar" onClick={() => setShowProfileSheet(true)} title="Tài khoản">
            {avatar
              ? <img src={avatar} width={32} height={32} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              : (userName?.[0]?.toUpperCase() || '?')}
          </button>
        )}

        {/* Top-right: theme */}
        <button className="theme-btn" onClick={toggleTheme} title="Đổi giao diện">
          {themeIcon(themeMode)}
        </button>

        {/* Cosmos rows */}
        <div className="hdr-cosmos">
          <div className="hdr-row r1"><span>☯</span></div>
          <div className="hdr-row r2"><span>⚊</span><span>⚋</span></div>
          <div className="hdr-row r3"><span>⚌</span><span>⚍</span><span>⚎</span><span>⚏</span></div>
          <div className="hdr-row r4"><span>☰</span><span>☱</span><span>☲</span><span>☳</span><span>☴</span><span>☵</span><span>☶</span><span>☷</span></div>
        </div>
        <div className="hdr-title">DỊCH LÝ VIỆT NAM</div>
        <div className="hdr-sub">LẬP QUẺ THEO GIỜ</div>

        {/* Live clock */}
        <div className="clock-box">
          <div className="clock">{clock}</div>
          <div className="gio-chi">{gioChi}</div>
          <div className="lunar">{lunarDisp}</div>
        </div>

        {/* Action buttons + inline calendar */}
        <div className="picker-wrap">
          <div className="picker-row">
            <Link href="/xem-que?view=boc" className="btn btn-boc">🃏 Bốc Quẻ</Link>
            <Link href="/xem-que?view=boc&tab=sdt" className="btn" style={{borderColor:'#2a5a7a',color:'#6ab8d8',background:'linear-gradient(135deg,#06101a,#0a1828)'}}>📱 Số ĐT</Link>
            <Link href="/xem-que?view=boc&tab=bsx" className="btn" style={{borderColor:'#5a5a2a',color:'#c8c870',background:'linear-gradient(135deg,#1a1a06,#2a2810)'}}>🚗 Biển số</Link>
          </div>

          {/* Inline calendar */}
          <div className="cal-inline">
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={() => navMonth(-1)}>‹</button>
              <span style={{color:'var(--gold)',fontSize:'13px',fontWeight:'700',letterSpacing:'0.5px',padding:'3px 10px'}}>
                {MN[month-1]} {year}
              </span>
              <button className="cal-nav-btn" onClick={() => navMonth(1)}>›</button>
            </div>
            <div className="cal-dows">
              {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
                <div key={d} className="cal-dow">{d}</div>
              ))}
            </div>
            <div className="cal-grid">
              {Array.from({length: firstDow}).map((_, i) => <div key={`e${i}`} className="cal-day empty" />)}
              {Array.from({length: daysInMonth}).map((_, i) => {
                const d = i + 1
                const lu = toLunar(year, month, d)
                const isToday = d === todayVN.D && month === todayVN.M && year === todayVN.Y
                const isSel = d === selDay
                const hasEvt = lu && anniversaries.some(e => e.lm === lu.lm && e.ld === lu.ld)
                return (
                  <div
                    key={d}
                    className={`cal-day${isToday?' today':''}${isSel?' selected':''}${hasEvt?' has-evt':''}`}
                    onClick={() => { setSelDay(d); setSelHour(isToday ? getVNNow().h : 11) }}
                  >
                    <div className="cal-solar">{d}</div>
                    <div className={`cal-lunar${lu?.ld===1?' lm-new':''}`}>
                      {lu ? (lu.ld===1 ? `${lu.ld}/${lu.lm}` : lu.ld) : ''}
                    </div>
                    <div className="cal-dot" />
                  </div>
                )
              })}
            </div>
          </div>

          {isNotToday && (
            <button className="btn-now" onClick={goNow}>↺ Quay về hôm nay</button>
          )}
        </div>
      </div>

      {/* ── 12 GIỜ BAR ── */}
      <div className="bar-wrap">
        <div className="bar-title">12 GIỜ TRONG NGÀY</div>
        <div className="bar-scroll" id="bar-scroll">
          {gio12.map(g => (
            <div
              key={g.chi}
              className={`bar-cell${g.isSelected?' active':''}${g.isNow?' now-marker':''}`}
              onClick={() => setSelHour(g.h)}
            >
              <div className="bc-chi">{g.chi}</div>
              <div className="bc-time">{g.label}</div>
              <div className="bc-que">{g.queName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HEXAGRAM DETAIL ── */}
      <div style={{padding:'12px 12px 0',maxWidth:'540px',margin:'0 auto'}}>
        {selDay && selLunar && selQue ? (
          <>
            {/* Date summary */}
            <div style={{
              background:'var(--bg3)',border:'1px solid var(--border)',
              borderRadius:'10px',padding:'10px 14px',marginBottom:'10px',textAlign:'center',
            }}>
              <div style={{color:'var(--gold-light)',fontSize:'15px',fontWeight:'600',letterSpacing:'1px'}}>
                {pad(selDay)}/{pad(month)}/{year}
              </div>
              <div style={{color:'var(--text2)',fontSize:'12px',marginTop:'3px',letterSpacing:'0.5px'}}>
                Ngày {selLunar.ld} tháng {selLunar.lm} năm {selLunar.yn}
              </div>
            </div>

            {/* Hexagram card */}
            <div style={{
              background:'var(--card-bg)',border:'1px solid var(--border)',
              borderRadius:'14px',padding:'18px 16px',textAlign:'center',marginBottom:'10px',
            }}>
              <div style={{fontSize:'10px',letterSpacing:'3px',color:'var(--gold-dark)',marginBottom:'10px',fontWeight:'700'}}>
                QUẺ GIỜ {selGioChi?.toUpperCase()}
              </div>
              <div style={{fontSize:'22px',fontWeight:'700',color:'var(--gold-light)',letterSpacing:'1px',lineHeight:'1.3'}}>
                {selQue}
              </div>
              <div style={{marginTop:'14px'}}>
                <Link href="/xem-que" style={{
                  color:'var(--gold-light)',fontSize:'12px',textDecoration:'none',
                  border:'1px solid var(--gold-dark)',borderRadius:'20px',
                  padding:'8px 20px',letterSpacing:'1px',background:'var(--bg3)',display:'inline-block',
                }}>
                  ☯ Xem Chi Tiết Trong Ngày
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div style={{textAlign:'center',color:'var(--text3)',fontSize:'13px',padding:'2rem 0',lineHeight:'2'}}>
            Chọn ngày trong lịch và giờ bên trên để xem quẻ
          </div>
        )}
      </div>

      <div style={{height:'40px'}} />

      {/* ── LOGIN MODAL ── */}
      {showLoginModal && (
        <div
          className="auth-overlay show"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false) }}
        >
          <div className="auth-modal">
            <button className="auth-modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
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

      {/* ── PROFILE BOTTOM SHEET ── */}
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
              <Link
                href="/lich-su"
                className="profile-menu-item"
                onClick={() => setShowProfileSheet(false)}
              >
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
    </div>
  )
}
