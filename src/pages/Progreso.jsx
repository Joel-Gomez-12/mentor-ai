import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'

const CONDICIONES = [
  {
    num: 1,
    icon: '🌑',
    name: 'Semilla',
    desc: 'Sin presencia, sin datos, sin ventas. El proyecto solo existe en tu mente.',
    color: '#6B7280',
    colorDim: 'rgba(107,114,128,0.15)',
    xpMin: 0, xpMax: 100,
    formula: [
      'Crea tu canal: elige dónde vas a aparecer',
      'Construye tu Marca Personal: bio, historia y pitch',
      'Valida el problema: habla con 10 personas',
      'Lanza un MVP: algo real que puedas mostrar hoy',
    ]
  },
  {
    num: 2,
    icon: '⚠️',
    name: 'Alerta Roja',
    desc: 'Caída pronunciada o alguien asumiendo tu rol. Situación de emergencia.',
    color: '#C0392B',
    colorDim: 'rgba(192,57,43,0.15)',
    xpMin: 100, xpMax: 250,
    formula: [
      'Para todo. Cancela la agenda normal. Modo crisis activado.',
      'Identifica el problema raíz con datos reales, no suposiciones',
      'Declara el estado de peligro: sé honesto contigo',
      'Auditoría de ética: ¿qué has hecho mal o evitado hacer?',
      'Rediseña tu rutina para que este peligro no pueda volver',
      'Escribe tu nueva política: 3 reglas no negociables',
    ]
  },
  {
    num: 3,
    icon: '🆘',
    name: 'Emergencia',
    desc: 'Estadísticas bajando o estancadas. Sin crecimiento, el negocio se contrae.',
    color: '#E67E22',
    colorDim: 'rgba(230,126,34,0.15)',
    xpMin: 250, xpMax: 500,
    formula: [
      'Activa la promoción: publica contenido hoy, ahora. Llama a 5 contactos.',
      'Cambia el enfoque: ¿qué has dejado de hacer que antes funcionaba?',
      'Recorta gastos no esenciales. Solo lo que genera ingreso directo.',
      'Prepara la capacidad: ¿puedes entregar más si consigues clientes?',
      'Endurece la rutina: horarios fijos, métricas diarias, sin excusas.',
    ]
  },
  {
    num: 4,
    icon: '📊',
    name: 'Tracción',
    desc: 'Crecimiento gradual estable. Las cosas van bien pero sin grandes picos.',
    color: '#F39C12',
    colorDim: 'rgba(243,156,18,0.15)',
    xpMin: 500, xpMax: 1000,
    formula: [
      'No rompas lo que funciona. Identifica tus 3 acciones ganadoras.',
      'Cuando algo sube, analiza el por qué y multiplícalo.',
      'Cuando algo baja, actúa rápido antes de que se convierta en emergencia.',
      'Potencia lo que sube, repara lo que baja.',
    ]
  },
  {
    num: 5,
    icon: '📈',
    name: 'Escala',
    desc: 'Crecimiento explosivo. Más demanda de la que puedes gestionar.',
    color: '#3498DB',
    colorDim: 'rgba(52,152,219,0.15)',
    xpMin: 1000, xpMax: 2000,
    formula: [
      'Frena el gasto. No hagas compromisos nuevos aunque el dinero entre.',
      'Cancela deudas. Esta es la ventana para quedar a cero.',
      'Invierte en capacidad de entrega, no en lujos.',
      'Encuentra el driver de esta escala. Multiplícalo.',
    ]
  },
  {
    num: 6,
    icon: '👑',
    name: 'Dominio',
    desc: 'Nivel alto sostenido. Una caída puntual no amenaza tu supervivencia.',
    color: '#27AE60',
    colorDim: 'rgba(39,174,96,0.15)',
    xpMin: 2000, xpMax: 5000,
    formula: [
      'No cortes conexiones clave. Hazlas propias y formales.',
      'Documenta todo tu sistema. Que funcione sin que estés tú.',
      'Escribe los manuales de tu negocio. Cada proceso, cada decisión.',
      'Construye el equipo que puede reemplazarte en cada función.',
    ]
  },
]

const AREAS = [
  { name: 'Visibilidad',  value: 0,  gradient: 'linear-gradient(90deg, #6B7280, #9CA3AF)' },
  { name: 'Ventas',       value: 0,  gradient: 'linear-gradient(90deg, #F39C12, #f5c04a)' },
  { name: 'Finanzas',     value: 0,  gradient: 'linear-gradient(90deg, #27AE60, #6ee7b7)' },
  { name: 'Operaciones',  value: 0,  gradient: 'linear-gradient(90deg, #3498DB, #818cf8)' },
  { name: 'Equipo',       value: 0,  gradient: 'linear-gradient(90deg, #C0392B, #fca5a5)' },
]

export default function Progreso({ onNavigate, currentPage }) {
  const { racha, xp, condicion } = useAuth()

  const condicionActual = CONDICIONES[Math.min((condicion || 1) - 1, 5)]
  const condicionSiguiente = CONDICIONES[Math.min((condicion || 1), 5)]

  const xpActual    = xp || 0
  const xpMin       = condicionActual.xpMin
  const xpMax       = condicionActual.xpMax
  const pct = xpMax > xpMin
    ? Math.min(Math.round(((xpActual - xpMin) / (xpMax - xpMin)) * 100), 100)
    : 0

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Mi progreso
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24 }}>
        Tu evolución como emprendedor, visualizada.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Card 1 — Condición actual */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${condicionActual.color}44`, borderRadius: 'var(--radius)', padding: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center top, ${condicionActual.color}18 0%, transparent 60%)`, pointerEvents: 'none' }} />

          {/* Badge condición */}
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: condicionActual.colorDim,
            border: `3px solid ${condicionActual.color}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: `0 0 40px ${condicionActual.color}33`
          }}>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: condicionActual.color, marginBottom: 2 }}>COND</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text)', lineHeight: 1 }}>
              {condicionActual.num}
            </span>
          </div>

          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{condicionActual.icon}</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: condicionActual.color, marginBottom: 8 }}>
            {condicionActual.name}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            {condicionActual.desc}
          </p>
          {condicion < 6 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Siguiente condición: <strong style={{ color: condicionSiguiente.color }}>{condicionSiguiente.icon} {condicionSiguiente.name}</strong>
            </p>
          )}

          {/* XP bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>{xpActual} XP</span>
            <span>{xpMax} XP siguiente condición</span>
          </div>
          <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${condicionActual.color}, ${condicionActual.color}99)`, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Card 2 — Racha */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Racha activa: {racha} días
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Cada día que usas la app, construyes disciplina.
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{
                width: 26, height: 26, borderRadius: 6,
                background: i < racha ? 'var(--indigo)' : 'var(--surface2)',
                border: `1px solid ${i < racha ? 'var(--indigo)' : 'var(--border)'}`,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>⚡ Hoy: <strong style={{ color: 'var(--jedi)' }}>Activo</strong></span>
            <span>📊 XP total: <strong style={{ color: 'var(--gold)' }}>{xpActual} XP</strong></span>
          </div>
        </div>

        {/* Card 3 — Fórmula de tu condición */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${condicionActual.color}44`, borderRadius: 'var(--radius)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '1rem' }}>📋</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Fórmula — {condicionActual.name}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Estos son los pasos para avanzar a la siguiente condición:
          </p>
          {condicionActual.formula.map((paso, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 0',
              borderBottom: i < condicionActual.formula.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: condicionActual.colorDim,
                border: `1px solid ${condicionActual.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: condicionActual.color
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>
                {paso}
              </p>
            </div>
          ))}
        </div>

        {/* Card 4 — Mapa de condiciones */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: '1rem' }}>🗺️</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Mapa de condiciones
            </span>
          </div>

          {CONDICIONES.map(c => {
            const completado = c.num < condicion
            const actual     = c.num === condicion
            const futuro     = c.num > condicion

            return (
              <div key={c.num} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                background: actual ? `${c.color}15` : 'transparent',
                border: actual ? `1px solid ${c.color}44` : '1px solid transparent',
                marginBottom: 6, opacity: futuro ? 0.45 : 1,
                transition: 'all var(--transition)'
              }}>
                {/* Badge */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: completado ? 'rgba(39,174,96,0.15)' : actual ? c.colorDim : 'var(--surface3)',
                  border: `2px solid ${completado ? '#27AE60' : actual ? c.color : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: completado ? '0.8rem' : '0.75rem', fontWeight: 700,
                  color: completado ? '#27AE60' : actual ? c.color : 'var(--text-muted)'
                }}>
                  {completado ? '✓' : c.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: actual ? 700 : 500, fontSize: '0.88rem', color: actual ? c.color : 'var(--text-soft)' }}>
                    {c.num}. {c.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {c.desc.substring(0, 55)}...
                  </div>
                </div>

                {actual && (
                  <span style={{
                    padding: '2px 10px', borderRadius: 99,
                    fontSize: '0.65rem', fontWeight: 700,
                    background: c.color, color: 'white', flexShrink: 0
                  }}>
                    Actual
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}