'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { updateQueNote, deleteQue } from '../xem-que/actions'
import UserButton from '../components/UserButton'
import '../xem-que/dichly.css'

// ─── Hexagram data ─────────────────────────────────────────────────────────────
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

const SOURCE_LABEL={'xem_gio':'Xem Giờ','boc_bai':'Bốc Bài','bien_so':'Biển Số','so_dt':'Số ĐT'}

function CardBadge({str}){
  const isRed=str.includes('♥')||str.includes('♦')
  return(
    <span style={{display:'inline-block',background:'#fff',border:'1px solid #ccc',borderRadius:'4px',padding:'1px 5px',fontSize:'13px',fontWeight:'800',color:isRed?'#cc0000':'#111111',lineHeight:'1.3'}}>
      {str}
    </span>
  )
}
function SourceDataDisplay({source,data}){
  if(!data)return null
  if(source==='boc_bai'){
    const cards=data.split(' · ')
    return(
      <span>
        {cards.map((c,i)=>(
          <span key={i}>
            {i>0&&<span style={{color:'var(--text3)',margin:'0 4px'}}>·</span>}
            <CardBadge str={c}/>
          </span>
        ))}
      </span>
    )
  }
  return<span>{data}</span>
}
const SOURCE_FILTER=[
  {key:'all',label:'Tất cả'},
  {key:'xem_gio',label:'Xem Giờ'},
  {key:'boc_bai',label:'Bốc Bài'},
  {key:'bien_so',label:'Biển Số'},
  {key:'so_dt',label:'Số ĐT'},
]

// ─── Theme ─────────────────────────────────────────────────────────────────────
function autoThemeVal(){ const h=new Date().getHours(); return h>=6&&h<18?'light':'dark' }
function themeIcon(m){ return m==='auto'?'⏰':m==='light'?'☀':'☽' }

// ─── Hex helpers ───────────────────────────────────────────────────────────────
function nameToTrigs(name){
  for(let up=1;up<=8;up++)
    for(let lo=1;lo<=8;lo++)
      if(HN[up-1][lo-1]===name)return{up,lo}
  return null
}

function HexLines({up,lo,mov}){
  const L6=[...TL[lo],...TL[up]]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
      {[5,4,3,2,1,0].map(i=>{
        const isM=mov===i+1
        const color=isM?'var(--red)':'var(--gold)'
        return(
          <div key={i} style={{width:'54px',height:'7px',display:'flex',gap:'4px'}}>
            {L6[i]===1
              ?<div style={{width:'54px',height:'7px',borderRadius:'3px',background:color,flexShrink:0}}/>
              :<><div style={{width:'23px',height:'7px',borderRadius:'3px',background:color}}/><div style={{width:'23px',height:'7px',borderRadius:'3px',background:color}}/></>
            }
          </div>
        )
      })}
    </div>
  )
}

function QueDetail({q}){
  const cols=[
    {label:'QUẺ CHÁNH',name:q.chanh_que,trigs:nameToTrigs(q.chanh_que),mov:q.hao_dong},
    {label:'HỘ QUÁI',name:q.ho_que,trigs:nameToTrigs(q.ho_que),mov:null},
    {label:'QUẺ BIẾN',name:q.bien_que,trigs:nameToTrigs(q.bien_que),mov:q.hao_dong},
  ]
  return(
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'12px'}}>
      {cols.map(c=>(
        <div key={c.label} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'10px',padding:'10px 8px',textAlign:'center'}}>
          <div style={{fontSize:'9px',letterSpacing:'2px',color:'var(--gold-dark)',fontWeight:'700',marginBottom:'6px'}}>{c.label}</div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'6px'}}>
            {c.trigs?<HexLines up={c.trigs.up} lo={c.trigs.lo} mov={c.mov}/>:<span style={{color:'var(--text3)',fontSize:'11px'}}>—</span>}
          </div>
          <div style={{fontSize:'11px',color:'var(--gold-light)',fontWeight:'600',lineHeight:'1.3'}}>{c.name||'—'}</div>
          {c.mov&&<div style={{fontSize:'10px',color:'var(--red)',marginTop:'3px'}}>Hào {c.mov} động</div>}
        </div>
      ))}
    </div>
  )
}

function formatDate(iso){
  if(!iso)return'—'
  const d=new Date(iso)
  const vn=new Date(d.getTime()+7*3600*1000)
  const p=n=>String(n).padStart(2,'0')
  return`${p(vn.getUTCDate())}/${p(vn.getUTCMonth()+1)}/${vn.getUTCFullYear()} ${p(vn.getUTCHours())}:${p(vn.getUTCMinutes())}`
}
function formatSolarDate(s){
  if(!s)return''
  const[y,m,d]=s.split('-')
  return`${d}/${m}/${y}`
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function LichSuApp({savedQues,user}){
  const [ques,setQues]=useState(savedQues)
  const [filter,setFilter]=useState('all')
  const [expandedId,setExpandedId]=useState(null)
  const [editingId,setEditingId]=useState(null)
  const [editNote,setEditNote]=useState('')
  const [deletingId,setDeletingId]=useState(null)
  const [themeMode,setThemeMode]=useState(
    ()=>typeof window!=='undefined'?(localStorage.getItem('theme-mode')||'auto'):'auto'
  )

  // Theme management — synced with localStorage (same key as xem-que)
  function applyTheme(mode){
    const t=mode==='auto'?autoThemeVal():mode
    document.documentElement.setAttribute('data-theme',t)
    localStorage.setItem('theme-mode',mode)
    setThemeMode(mode)
  }
  function toggleTheme(){
    applyTheme(themeMode==='auto'?'light':themeMode==='light'?'dark':'auto')
  }
  useEffect(()=>{
    const t=themeMode==='auto'?autoThemeVal():themeMode
    document.documentElement.setAttribute('data-theme',t)
  },[]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered=filter==='all'?ques:ques.filter(q=>q.source===filter)

  async function handleDelete(id){
    setDeletingId(null)
    setQues(prev=>prev.filter(q=>q.id!==id))
    if(expandedId===id)setExpandedId(null)
    await deleteQue(id).catch(()=>{})
  }
  async function handleSaveNote(id){
    await updateQueNote(id,editNote).catch(()=>{})
    setQues(prev=>prev.map(q=>q.id===id?{...q,ghi_chu:editNote}:q))
    setEditingId(null)
  }

  return(
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      <UserButton user={user} />

      {/* Theme toggle fixed top-right */}
      <button
        onClick={toggleTheme}
        title="Đổi giao diện"
        style={{position:'fixed',top:10,right:12,zIndex:30,background:'transparent',border:'1px solid var(--border)',borderRadius:'20px',color:'var(--text2)',fontSize:'16px',padding:'4px 10px',cursor:'pointer'}}
      >
        {themeIcon(themeMode)}
      </button>

      <div style={{maxWidth:'680px',margin:'0 auto',padding:'20px 12px 40px'}}>
        {/* Nav */}
        <div style={{display:'flex',gap:'12px',marginBottom:'16px'}}>
          <Link href="/" style={{color:'var(--gold-dark)',fontSize:'12px',textDecoration:'none',letterSpacing:'1px'}}>← Trang chủ</Link>
          <Link href="/xem-que" style={{color:'var(--gold-dark)',fontSize:'12px',textDecoration:'none',letterSpacing:'1px'}}>☯ Xem Quẻ</Link>
        </div>

        {/* Title */}
        <div style={{textAlign:'center',marginBottom:'20px'}}>
          <div style={{color:'var(--gold)',fontSize:'14px',letterSpacing:'4px',fontWeight:'600'}}>LỊCH SỬ QUẺ</div>
          <div style={{color:'var(--text3)',fontSize:'11px',marginTop:'4px'}}>{ques.length} quẻ đã lưu</div>
        </div>

        {/* Filter */}
        <div style={{display:'flex',gap:'6px',marginBottom:'16px',flexWrap:'wrap'}}>
          {SOURCE_FILTER.map(f=>(
            <button key={f.key}
              onClick={()=>setFilter(f.key)}
              style={{
                padding:'6px 14px',borderRadius:'20px',fontSize:'12px',cursor:'pointer',letterSpacing:'1px',transition:'all 0.15s',
                border:filter===f.key?'1px solid var(--gold-dark)':'1px solid var(--border)',
                background:filter===f.key?'var(--bg3)':'transparent',
                color:filter===f.key?'var(--gold-light)':'var(--text3)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length===0?(
          <div style={{textAlign:'center',color:'var(--text3)',padding:'60px 20px'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>☯</div>
            <div style={{fontSize:'14px'}}>Chưa có quẻ nào</div>
            <Link href="/xem-que" style={{color:'var(--gold-dark)',fontSize:'13px',textDecoration:'none',display:'inline-block',marginTop:'12px'}}>Xem quẻ →</Link>
          </div>
        ):(
          filtered.map(q=>{
            const isExp=expandedId===q.id
            const isEditing=editingId===q.id
            const isDeleting=deletingId===q.id
            return(
              <div key={q.id} style={{background:'var(--card-bg)',border:`1px solid ${isExp?'var(--gold-dark)':'var(--border)'}`,borderRadius:'12px',padding:'14px 16px',marginBottom:'8px',cursor:'pointer',transition:'border-color 0.15s'}}>

                {/* Summary row */}
                <div onClick={()=>setExpandedId(isExp?null:q.id)}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'4px'}}>
                    <div style={{fontSize:'11px',color:'var(--text3)'}}>{formatDate(q.created_at)}</div>
                    <span style={{display:'inline-block',fontSize:'10px',letterSpacing:'1px',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'var(--bg3)',color:'var(--gold-dark)',border:'1px solid var(--border)'}}>
                      {SOURCE_LABEL[q.source]||q.source}
                    </span>
                  </div>
                  <div style={{fontSize:'18px',fontWeight:'700',color:'var(--gold-light)',marginBottom:'2px'}}>{q.chanh_que}</div>
                  <div style={{fontSize:'12px',color:'var(--red)'}}>Hào {q.hao_dong} động</div>
                  {q.source_data&&<div style={{fontSize:'12px',marginTop:'3px',display:'flex',alignItems:'center',gap:'4px'}}>
                    <span style={{color:'var(--text3)'}}>↳</span>
                    <SourceDataDisplay source={q.source} data={q.source_data}/>
                  </div>}
                  {q.ghi_chu&&<div style={{fontSize:'12px',color:'var(--text2)',marginTop:'4px',fontStyle:'italic'}}>&ldquo;{q.ghi_chu}&rdquo;</div>}
                  <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'4px',lineHeight:'1.6'}}>
                    {q.solar_date&&<span>🗓 {formatSolarDate(q.solar_date)}</span>}
                    {q.gio_chi&&<span> · Giờ {q.gio_chi}</span>}
                    {q.lunar_date&&<span style={{color:'var(--gold-dark)'}}> · ☽ Ngày {q.lunar_date}</span>}
                  </div>
                  <div style={{textAlign:'right',color:'var(--text3)',fontSize:'11px',marginTop:'4px'}}>{isExp?'▲':'▼'}</div>
                </div>

                {/* Expanded */}
                {isExp&&(
                  <div>
                    <QueDetail q={q}/>
                    <div style={{display:'flex',gap:'8px',marginTop:'12px',flexWrap:'wrap',alignItems:'flex-start'}}>
                      {isEditing?(
                        <>
                          <textarea
                            value={editNote}
                            onChange={e=>setEditNote(e.target.value)}
                            placeholder="Ghi chú…"
                            autoFocus
                            style={{flex:1,minWidth:'160px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text)',fontSize:'13px',padding:'8px',resize:'vertical',minHeight:'60px',outline:'none',fontFamily:'inherit'}}
                          />
                          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                            <button onClick={()=>handleSaveNote(q.id)}
                              style={{background:'var(--bg3)',border:'1px solid var(--gold-dark)',borderRadius:'8px',color:'var(--gold-light)',fontSize:'11px',padding:'6px 12px',cursor:'pointer'}}>
                              Lưu
                            </button>
                            <button onClick={()=>setEditingId(null)}
                              style={{background:'transparent',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text3)',fontSize:'11px',padding:'6px 12px',cursor:'pointer'}}>
                              Hủy
                            </button>
                          </div>
                        </>
                      ):(
                        <>
                          <button onClick={()=>{setEditingId(q.id);setEditNote(q.ghi_chu||'')}}
                            style={{background:'transparent',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text2)',fontSize:'11px',padding:'5px 12px',cursor:'pointer'}}>
                            ✏️ {q.ghi_chu?'Sửa ghi chú':'Thêm ghi chú'}
                          </button>
                          {isDeleting?(
                            <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                              <span style={{fontSize:'12px',color:'var(--red)'}}>Xóa?</span>
                              <button onClick={()=>handleDelete(q.id)}
                                style={{background:'transparent',border:'1px solid var(--red)',borderRadius:'8px',color:'var(--red)',fontSize:'11px',padding:'5px 10px',cursor:'pointer'}}>
                                ✓ Xóa
                              </button>
                              <button onClick={()=>setDeletingId(null)}
                                style={{background:'transparent',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text3)',fontSize:'11px',padding:'5px 10px',cursor:'pointer'}}>
                                Hủy
                              </button>
                            </div>
                          ):(
                            <button onClick={e=>{e.stopPropagation();setDeletingId(q.id)}}
                              style={{background:'transparent',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--red)',fontSize:'11px',padding:'5px 12px',cursor:'pointer'}}>
                              🗑 Xóa
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
