export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: '36px', opacity: 0.6 }}>☯</div>
      <div style={{ color: '#8a6a10', fontSize: '12px', letterSpacing: '3px' }}>
        ĐANG TẢI...
      </div>
    </div>
  )
}
