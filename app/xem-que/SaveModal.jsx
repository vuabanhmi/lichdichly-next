'use client'
import { useState } from 'react'
import { saveQue } from './actions'

export default function SaveModal({ queResult, onClose }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await saveQue({ ...queResult, note })
      setSaved(true)
      setTimeout(onClose, 1200)
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  const s = {
    overlay: {
      position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:100,padding:'16px',
    },
    modal: {
      background:'#13131f',border:'1px solid #2a2a3a',
      borderRadius:'16px',padding:'24px',width:'100%',maxWidth:'380px',
    },
    title: {
      fontSize:'11px',letterSpacing:'3px',color:'#8a6a10',
      fontWeight:'700',marginBottom:'16px',textAlign:'center',
    },
    queName: {
      fontSize:'20px',fontWeight:'700',color:'#f0c860',
      textAlign:'center',marginBottom:'6px',
    },
    hao: {
      fontSize:'13px',color:'#e05040',textAlign:'center',marginBottom:'20px',
    },
    label: {
      fontSize:'11px',letterSpacing:'2px',color:'#5a4a2a',
      fontWeight:'700',marginBottom:'8px',display:'block',
    },
    textarea: {
      width:'100%',background:'#0c0c14',border:'1px solid #2a2a3a',
      borderRadius:'10px',color:'#e8e0d0',fontSize:'14px',
      padding:'12px',resize:'vertical',minHeight:'80px',
      outline:'none',fontFamily:'inherit',lineHeight:'1.6',
      boxSizing:'border-box',
    },
    btnRow: {
      display:'flex',gap:'10px',marginTop:'16px',
    },
    btnCancel: {
      flex:1,background:'transparent',border:'1px solid #2a2a3a',
      borderRadius:'20px',color:'#5a4a2a',fontSize:'13px',
      padding:'10px',cursor:'pointer',
    },
    btnSave: {
      flex:2,background:'linear-gradient(135deg,#2a1e06,#3a2c0a)',
      border:'1px solid #8a6a10',borderRadius:'20px',
      color:'#f0c860',fontSize:'13px',letterSpacing:'1px',
      padding:'10px',cursor:'pointer',
    },
    error: { fontSize:'12px',color:'#e05040',textAlign:'center',marginTop:'8px' },
    success: { fontSize:'13px',color:'#7acd7a',textAlign:'center',marginTop:'8px',letterSpacing:'1px' },
  }

  return (
    <div style={s.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.title}>LƯU QUẺ</div>
        <div style={s.queName}>{queResult?.queName}</div>
        <div style={s.hao}>Hào {queResult?.hao} động</div>
        <label style={s.label}>GHI CHÚ CÁ NHÂN</label>
        <textarea
          style={s.textarea}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Câu hỏi, hoàn cảnh, cảm nhận…"
          autoFocus
        />
        {error && (
          error === 'Unauthorized'
            ? <div style={s.error}>
                Cần đăng nhập để lưu quẻ.{' '}
                <a href="/login" target="_blank" rel="noreferrer"
                  style={{color:'#f0c860',textDecoration:'underline'}}>
                  Đăng nhập →
                </a>
                <div style={{fontSize:'11px',color:'#5a4a2a',marginTop:'4px'}}>
                  (Mở tab mới, sau khi đăng nhập quay lại bấm lưu tiếp)
                </div>
              </div>
            : <div style={s.error}>{error}</div>
        )}
        {saved && <div style={s.success}>✓ Đã lưu!</div>}
        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>Hủy</button>
          <button
            style={{...s.btnSave, opacity: saving || saved ? 0.6 : 1}}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? '✓ Đã lưu!' : saving ? 'Đang lưu…' : '💾 Lưu Quẻ'}
          </button>
        </div>
      </div>
    </div>
  )
}
