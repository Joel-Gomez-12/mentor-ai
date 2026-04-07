import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'

const CONDICIONES = [
  {
    num: 1,
    icon: '💀',
    name: 'Inexistencia',
    desc: 'El proyecto no existe en el mercado. Sin presencia, sin clientes, sin datos.',
    color: '#6B7280',
    colorDim: 'rgba(107,114,128,0.15)',
    xpMin: 0, xpMax: 100,
    formula: [
      'Crea tu canal: elige dónde vas a aparecer (Instagram, LinkedIn, YouTube...)',
      'Construye tu Marca Personal: prepara tu bio, tu historia y tu pitch de 30 segundos',
      'Valida el problema: habla con 10 personas de tu público objetivo antes de producir nada',
      'Lanza un MVP: algo real que puedas mostrar hoy',
    ]
  },
  {
    num: 2,
    icon: '🌱',
    name: 'Nacimiento',
    desc: 'Primeras señales reales de interés. Ya existen indicios de que el mercado responde.',
    color: '#16A34A',
    colorDim: 'rgba(22,163,74,0.15)',
    xpMin: 100, xpMax: 500,
    formula: [
      'Consigue tus primeros 3 clientes o usuarios reales, aunque sea gratis',
      'Recoge feedback activo: pregunta qué valoran y qué mejorarían',
      'Documenta tu propuesta de valor en una sola frase clara',
      'Identifica el canal que más conversión te da y dóblalo',
    ]
  },
  {
    num: 3,
    icon: '⚔️',
    name: 'Supervivencia',
    desc: 'El negocio cubre o se acerca a cubrir sus costes. La batalla por el break-even.',
    color: '#C0392B',
    colorDim: 'rgba(192,57,43,0.15)',
    xpMin: 500, xpMax: 1500,
    formula: [
      'Calcula tu punto de equilibrio exacto: ¿cuánto necesitas facturar para no perder?',
      'Implementa un sistema básico de control de caja: ingresos vs gastos semanales',
      'Crea una reserva mínima: separa un porcentaje fijo antes de cualquier gasto',
      'Elimina todos los gastos que no generan ingreso directo',
      'Establece 3 meses seguidos cubriendo costes fijos como objetivo',
    ]
  },
  {
    num: 4,
    icon: '📊',
    name: 'Estabilidad',
    desc: 'El proyecto funciona con cierto orden y repetibilidad. Los ingresos son más predecibles.',
    color: '#F39C12',
    colorDim: 'rgba(243,156,18,0.15)',
    xpMin: 1500, xpMax: 4000,
    formula: [
      'Documenta tus procesos clave: que alguien más pueda ejecutarlos',
      'Crea un sistema de seguimiento de clientes (CRM básico)',
      'Identifica tus 3 fuentes de ingreso más estables y protégelas',
      'Empieza a delegar tareas operativas para liberar tu tiempo estratégico',
    ]
  },
  {
    num: 5,
    icon: '🚀',
    name: 'Expansión',
    desc: 'El sistema funciona bien. Es momento de crecer con intención y estructura.',
    color: '#3498DB',
    colorDim: 'rgba(52,152,219,0.15)',
    xpMin: 4000, xpMax: 10000,
    formula: [
      'Identifica el driver principal de crecimiento y multiplícalo',
      'Incorpora personas o herramientas que escalen sin que estés tú',
      'Abre un nuevo canal o mercado basándote en datos reales, no suposiciones',
      'Invierte en capacidad de entrega antes de invertir en captación',
    ]
  },
  {
    num: 6,
    icon: '👑',
    name: 'Dominio',
    desc: 'Sistema autónomo. El negocio funciona con abundancia y sin depender del fundador.',
    color: '#27AE60',
    colorDim: 'rgba(39,174,96,0.15)',
    xpMin: 10000, xpMax: 99999,
    formula: [
      'Documenta todo el sistema: que funcione sin que estés tú presente',
      'Construye el equipo que puede reemplazarte en cada función clave',
      'Crea manuales de operación para cada proceso crítico del negocio',
      'Enfócate en visión y relaciones estratégicas, no en operaciones',
    ]
  },
]


export default function Progreso({ onNavigate, currentPage }) {
  const { xp, condicion } = useAuth()

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

        {/* Card 2 — Próximo nivel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Próximo nivel
            </span>
          </div>
          {condicion < 6 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ fontSize: '2.5rem' }}>{condicionSiguiente.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: condicionSiguiente.color }}>
                    {condicionSiguiente.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Faltan <strong style={{ color: 'var(--gold)' }}>{condicionSiguiente.xpMin - xpActual} XP</strong> para llegar
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${condicionActual.color}, ${condicionSiguiente.color})`, transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{xpActual} XP actuales</span>
                <span>{condicionSiguiente.xpMin} XP objetivo</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 10 }}>👑</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#27AE60' }}>
                Nivel máximo alcanzado
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Eres Dominio. El sistema trabaja para ti.
              </div>
            </div>
          )}
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