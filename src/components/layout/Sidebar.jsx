import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { section: 'Inicio', items: [
    { icon: '⚡', label: 'SISI — IA Principal',  page: 'sisi'  },
    { icon: '🏠', label: 'Dashboard',            page: 'home'  },
    { icon: '📡', label: 'Pulso del negocio',    page: 'pulso' },
  ]},
  { section: 'Capturar', items: [
    { icon: '💡', label: 'Capturar pensamiento', page: 'pensamiento' },
    { icon: '💰', label: 'Finanzas',             page: 'finanzas' },
  ]},
  { section: 'Estrategia', items: [
    { icon: '🗂️', label: 'Proyectos',           page: 'proyectos' },
    { icon: '📋', label: 'Plan del negocio',     page: 'plan' },
    { icon: '🧠', label: 'Mentores',             page: 'mentores' },
    { icon: '📇', label: 'Contactos',            page: 'contactos' },
    { icon: '🎓', label: 'Formación',            page: 'formacion' },
  ]},
  { section: 'Tú', items: [
    { icon: '🏆', label: 'Mi progreso', page: 'progreso' },
    { icon: '⚙️', label: 'Ajustes',    page: 'ajustes' },
  ]},
]

const CONDICIONES_NAMES = [
  'Inexistencia', 'Nacimiento', 'Supervivencia',
  'Estabilidad', 'Expansión', 'Dominio'
]

const CONDICIONES_COLORS = [
  '#6B7280', '#16A34A', '#C0392B',
  '#F39C12', '#3498DB', '#27AE60'
]

const LOGO_SVG = (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" stroke="#F0B429" strokeWidth="2.5" fill="none"/>
    <circle cx="32" cy="32" r="10" fill="#F0B429" opacity="0.15" stroke="#F0B429" strokeWidth="1.5"/>
    <circle cx="32" cy="32" r="4" fill="#F0B429"/>
    <path d="M14 28 Q18 18 28 20 Q24 10 36 12 Q44 8 48 18 Q56 20 54 30 Q58 40 50 44 Q48 54 38 52 Q34 58 26 54 Q16 54 14 44 Q8 38 14 28Z" stroke="#F0B429" strokeWidth="2" fill="none"/>
    <path d="M24 28 Q28 22 34 24" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M32 18 Q36 22 34 28" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M20 38 Q24 44 30 42" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M36 40 Q42 42 44 36" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <rect x="30" y="2" width="4" height="6" rx="1" fill="#F0B429"/>
    <rect x="30" y="56" width="4" height="6" rx="1" fill="#F0B429"/>
    <rect x="2" y="30" width="6" height="4" rx="1" fill="#F0B429"/>
    <rect x="56" y="30" width="6" height="4" rx="1" fill="#F0B429"/>
  </svg>
)

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
  const { signOut, xp, condicion } = useAuth()

  const condIdx    = Math.min((condicion || 1) - 1, 5)
  const condNombre = CONDICIONES_NAMES[condIdx]
  const condColor  = CONDICIONES_COLORS[condIdx]

  // XP progress bar dentro de la condición actual
  const XP_RANGES = [
    [0, 100], [100, 500], [500, 1500],
    [1500, 4000], [4000, 10000], [10000, 99999]
  ]
  const [xpMin, xpMax] = XP_RANGES[condIdx]
  const pct = xpMax > xpMin
    ? Math.min(Math.round((((xp || 0) - xpMin) / (xpMax - xpMin)) * 100), 100)
    : 0

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 99
          }}
        />
      )}

      <aside
        className={isOpen ? 'open' : ''}
        style={{
        width: 240,
        height: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 100,
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{ padding: '28px 22px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ marginBottom: 10 }}>{LOGO_SVG}</div>
          <div style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 800,
            fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)'
          }}>
            Mentor<span style={{ color: 'var(--gold)' }}> AI</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tu segundo cerebro empresarial
          </div>
        </div>

        {/* Andrea status */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '2px solid rgba(124,58,237,0.5)',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 0 10px rgba(124,58,237,0.3)'
          }}>
            <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>SISI</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span className="status-dot" />En línea contigo
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1,
          padding: '12px 10px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--surface3) transparent'
        }}>
          {NAV_ITEMS.map(({ section, items }) => (
            <div key={section}>
              <div style={{
                fontSize: '0.65rem', textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--text-muted)',
                padding: '10px 12px 6px'
              }}>{section}</div>
              {items.map(({ icon, label, page }) => {
                const isActive = currentPage === page
                return (
                  <button
                    key={page}
                    onClick={() => { onNavigate(page); onClose?.() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', transition: 'all var(--transition)',
                      fontSize: '0.88rem', width: '100%', textAlign: 'left',
                      border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                      background: isActive ? 'var(--indigo-dim)' : 'none',
                      color: isActive ? 'var(--text)' : 'var(--text-soft)',
                    }}
                  >
                    <span style={{ fontSize: '1rem', width: 20, textAlign: 'center', color: isActive ? 'var(--indigo)' : 'inherit' }}>
                      {icon}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer — Condición + XP */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>

          {/* Condición */}
          <div style={{ marginBottom: 4 }}>
            <span>
              Nivel {condicion} —{' '}
              <span style={{ color: condColor, fontWeight: 600 }}>{condNombre}</span>
            </span>
          </div>

          {/* XP actual */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>{xp || 0} XP</span>
            <span style={{ color: 'var(--text-muted)' }}>{xpMax} XP</span>
          </div>

          {/* XP bar con color de la condición */}
          <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 4, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{
              width: `${pct}%`, height: '100%', borderRadius: 99,
              background: `linear-gradient(90deg, ${condColor}, ${condColor}99)`,
              transition: 'width 1s ease'
            }} />
          </div>

          {/* Botón cerrar sesión */}
          <button
            onClick={async () => {
              try {
                await signOut()
              } catch (err) {
                console.error('Error cerrando sesión:', err)
              }
            }}
            style={{
              width: '100%', padding: '7px 0',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: '0.78rem', cursor: 'pointer'
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}