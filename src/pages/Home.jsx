import Layout from '../components/layout/Layout'

export default function Home({ onNavigate, currentPage }) {
  return (
    <Layout currentPage={currentPage || 'home'} onNavigate={onNavigate}>

      {/* Hero Andrea */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28,
        display: 'flex', alignItems: 'center', gap: 22,
        position: 'relative', overflow: 'hidden',
        boxShadow: 'var(--shadow)', marginBottom: 24
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(240,180,41,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--andrea-dim)', border: '3px solid var(--andrea)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', flexShrink: 0, boxShadow: '0 0 30px rgba(240,180,41,0.2)'
        }}>🧠</div>
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
            Hola, soy <span style={{ color: 'var(--andrea)' }}>Andrea</span>. ¿Qué hacemos hoy?
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', marginTop: 6 }}>
            Tu foco de hoy es <strong style={{ color: 'var(--andrea)' }}>ordenar ventas y reducir ruido.</strong> Tienes energía — úsala bien.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        Tu estado actual
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'NIVEL EMPRENDEDOR', value: 'Supervivencia', sub: 'Nivel 3 de 6', fill: 50, fillClass: 'fill-indigo' },
          { label: 'RACHA ACTIVA',      value: '🔥 12 días',    sub: '¡Tu mejor racha hasta hoy!', fill: 80, fillClass: 'fill-gold' },
          { label: 'EXPERIENCIA (XP)',  value: '320 XP',        sub: 'Próximo nivel a 500 XP', fill: 64, fillClass: 'fill-gold' },
          { label: 'FOCO DEL DÍA',      value: 'Ventas + Orden', sub: 'Según el pulso de hoy', fill: null, fillClass: null, color: 'var(--jedi)' },
        ].map(({ label, value, sub, fill, fillClass, color }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 20
          }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: color || 'var(--text)', marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: fill ? 10 : 0 }}>{sub}</div>
            {fill && (
              <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                <div className={fillClass} style={{ width: `${fill}%`, height: '100%', borderRadius: 99 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Accesos rápidos — 8 items */}
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        Accesos rápidos
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { icon: '📡', label: 'Pulso del negocio',    page: 'pulso' },
          { icon: '💡', label: 'Capturar pensamiento', page: 'pensamiento' },
          { icon: '📈', label: 'Registrar ingreso',    page: 'ingreso' },
          { icon: '📉', label: 'Registrar gasto',      page: 'gasto' },
          { icon: '🗂️', label: 'Proyectos',           page: 'proyectos' },
          { icon: '📋', label: 'Plan del negocio',     page: 'plan' },
          { icon: '🧠', label: 'Mentores',             page: 'mentores' },
          { icon: '📊', label: 'Mi progreso',          page: 'progreso' },
        ].map(({ icon, label, page }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 14px',
              cursor: 'pointer', textAlign: 'center',
              transition: 'all var(--transition)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
          >
            <span style={{ fontSize: '1.6rem' }}>{icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Resumen financiero */}
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        Resumen financiero del mes
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Ingresos este mes', value: '€0,00', sub: '0 registros', color: 'var(--jedi)',   border: 'var(--jedi)' },
          { label: 'Gastos este mes',   value: '€0,00', sub: '0 registros', color: 'var(--leo)',    border: 'var(--leo)' },
          { label: 'Balance neto',      value: '€0,00', sub: '¡Positivo! Buen trabajo.', color: 'var(--gold)', border: 'var(--gold)' },
        ].map(({ label, value, sub, color, border }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${border}`,
            borderRadius: 'var(--radius)', padding: 22
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

    </Layout>
  )
}