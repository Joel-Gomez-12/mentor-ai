export default function Topbar({ title, onMenuClick }) {
  const now = new Date()
  const fechaCorta = now.toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

  return (
    <div style={{
      padding: '18px 32px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(8,10,18,0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onMenuClick}
          style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.4rem', cursor: 'pointer' }}>
          ☰
        </button>
        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.78rem', color: 'var(--text-soft)',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          padding: '5px 12px', borderRadius: 99
        }}>
          📅 <strong style={{ color: 'var(--text)' }}>{fechaCorta}</strong>
        </div>
      </div>
    </div>
  )
}