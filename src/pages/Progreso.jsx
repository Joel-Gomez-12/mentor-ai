import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CONDICIONES = [
  {
    num: 1, icon: '🪴', name: 'Idea Semilla', color: '#6B7280', colorDim: 'rgba(107,114,128,0.15)',
    desc: 'El proyecto vive en tu cabeza. Sin presencia real, sin clientes, sin datos.',
    xpMin: 0, xpMax: 100,
    formula: [
      'Crea tu canal: elige dónde vas a aparecer (Instagram, LinkedIn, YouTube...)',
      'Construye tu Marca Personal: prepara tu bio, tu historia y tu pitch de 30 segundos',
      'Valida el problema: habla con 10 personas de tu público objetivo antes de producir nada',
      'Lanza un MVP: algo real que puedas mostrar hoy',
    ]
  },
  {
    num: 2, icon: '🌱', name: 'Nacimiento', color: '#16A34A', colorDim: 'rgba(22,163,74,0.15)',
    desc: 'Primeras señales reales de interés. Ya existen indicios de que el mercado responde.',
    xpMin: 100, xpMax: 500,
    formula: [
      'Consigue tus primeros 3 clientes o usuarios reales, aunque sea gratis',
      'Recoge feedback activo: pregunta qué valoran y qué mejorarían',
      'Documenta tu propuesta de valor en una sola frase clara',
      'Identifica el canal que más conversión te da y dóblalo',
    ]
  },
  {
    num: 3, icon: '⚔️', name: 'Supervivencia', color: '#C0392B', colorDim: 'rgba(192,57,43,0.15)',
    desc: 'El negocio cubre o se acerca a cubrir sus costes. La batalla por el break-even.',
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
    num: 4, icon: '📊', name: 'Estabilidad', color: '#F39C12', colorDim: 'rgba(243,156,18,0.15)',
    desc: 'El proyecto funciona con cierto orden y repetibilidad. Los ingresos son más predecibles.',
    xpMin: 1500, xpMax: 4000,
    formula: [
      'Documenta tus procesos clave: que alguien más pueda ejecutarlos',
      'Crea un sistema de seguimiento de clientes (CRM básico)',
      'Identifica tus 3 fuentes de ingreso más estables y protégelas',
      'Empieza a delegar tareas operativas para liberar tu tiempo estratégico',
    ]
  },
  {
    num: 5, icon: '🚀', name: 'Expansión', color: '#3498DB', colorDim: 'rgba(52,152,219,0.15)',
    desc: 'El sistema funciona bien. Es momento de crecer con intención y estructura.',
    xpMin: 4000, xpMax: 10000,
    formula: [
      'Identifica el driver principal de crecimiento y multiplícalo',
      'Incorpora personas o herramientas que escalen sin que estés tú',
      'Abre un nuevo canal o mercado basándote en datos reales, no suposiciones',
      'Invierte en capacidad de entrega antes de invertir en captación',
    ]
  },
  {
    num: 6, icon: '👑', name: 'Dominio', color: '#27AE60', colorDim: 'rgba(39,174,96,0.15)',
    desc: 'Sistema autónomo. El negocio funciona con abundancia y sin depender del fundador.',
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

  const condicionActual    = CONDICIONES[Math.min((condicion || 1) - 1, 5)]
  const condicionSiguiente = CONDICIONES[Math.min((condicion || 1), 5)]

  const xpActual = xp || 0
  const xpMin    = condicionActual.xpMin
  const xpMax    = condicionActual.xpMax
  const pct = xpMax > xpMin
    ? Math.min(Math.round(((xpActual - xpMin) / (xpMax - xpMin)) * 100), 100)
    : 0

  const donutData = [
    { value: pct,                    fill: condicionActual.color },
    { value: Math.max(0, 100 - pct), fill: '#e2f5f0' },
  ]

  const barData = CONDICIONES.map(c => ({
    name:     c.name.split(' ')[0].substring(0, 7),
    progreso: c.num < condicion ? 100 : c.num === condicion ? pct : 0,
    color:    c.color,
  }))

  const card = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 24,
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Mi progreso
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24 }}>
        Tu evolución como emprendedor, visualizada.
      </p>

      {/* ── Fila 1: Condición actual + Donut XP ── */}
      <div className="rg-2" style={{ gap: 16, marginBottom: 16 }}>

        {/* Card 1 — Condición actual */}
        <div style={{ ...card, border: `1px solid ${condicionActual.color}44`, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center top, ${condicionActual.color}18 0%, transparent 60%)`, pointerEvents: 'none' }} />

          <div style={{ width: 76, height: 76, borderRadius: '50%', background: condicionActual.colorDim, border: `3px solid ${condicionActual.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 0 32px ${condicionActual.color}33` }}>
            <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: condicionActual.color, marginBottom: 2 }}>COND</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.9rem', color: 'var(--text)', lineHeight: 1 }}>{condicionActual.num}</span>
          </div>

          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{condicionActual.icon}</div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: condicionActual.color, marginBottom: 8 }}>
            {condicionActual.name}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
            {condicionActual.desc}
          </p>

          {condicion < 6 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Siguiente: <strong style={{ color: condicionSiguiente.color }}>{condicionSiguiente.icon} {condicionSiguiente.name}</strong>
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>{xpActual} XP</span>
            <span>{xpMax} XP</span>
          </div>
          <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${condicionActual.color}, ${condicionActual.color}99)`, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Card 2 — Donut XP al siguiente nivel */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>
            🎯 XP hacia el siguiente nivel
          </div>

          <div style={{ position: 'relative', width: 168, height: 168, marginBottom: 20 }}>
            <PieChart width={168} height={168}>
              <Pie
                data={donutData} cx={84} cy={84}
                innerRadius={52} outerRadius={74}
                startAngle={90} endAngle={-270}
                dataKey="value" strokeWidth={0}
              >
                {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
            </PieChart>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: condicionActual.color, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>completado</div>
            </div>
          </div>

          {condicion < 6 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 6 }}>
                <span style={{ fontSize: '1.4rem' }}>{condicionSiguiente.icon}</span>
                <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: condicionSiguiente.color, fontSize: '1rem' }}>{condicionSiguiente.name}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Faltan <strong style={{ color: 'var(--gold)' }}>{Math.max(0, condicionSiguiente.xpMin - xpActual)} XP</strong> para llegar
              </div>
              <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 5, overflow: 'hidden', marginTop: 10, width: '100%' }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${condicionActual.color}, ${condicionSiguiente.color})`, transition: 'width 1s ease' }} />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>👑</div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#27AE60' }}>Nivel máximo alcanzado</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>El sistema trabaja para ti.</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fila 2: Mapa visual horizontal de condiciones (CAMBIO 5) ── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <span>🗺️</span>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Tu mapa de evolución empresarial
          </span>
        </div>

        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 520 }}>
            {CONDICIONES.flatMap((c, i) => {
              const done   = c.num < condicion
              const active = c.num === condicion
              const future = c.num > condicion

              const node = (
                <div key={`n${c.num}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0, width: 72 }}>
                  <div style={{
                    width: active ? 52 : 40, height: active ? 52 : 40,
                    borderRadius: '50%', flexShrink: 0,
                    background: done ? '#27AE60' : active ? c.color : 'var(--surface3)',
                    border: `2.5px solid ${done ? '#27AE60' : active ? c.color : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: active ? '1.25rem' : done ? '0.85rem' : '1rem',
                    opacity: future ? 0.35 : 1,
                    transition: 'all 0.3s',
                    boxShadow: active ? `0 0 22px ${c.color}55` : 'none',
                    color: done ? 'white' : 'inherit',
                  }}>
                    {done ? '✓' : c.icon}
                  </div>
                  <div style={{
                    fontSize: '0.58rem', fontWeight: active ? 700 : 500,
                    color: active ? c.color : 'var(--text-muted)',
                    textAlign: 'center', width: 66, lineHeight: 1.3,
                    opacity: future ? 0.5 : 1,
                  }}>
                    {c.name}
                  </div>
                  {active && (
                    <span style={{ fontSize: '0.55rem', padding: '2px 8px', borderRadius: 99, background: c.color, color: 'white', fontWeight: 700 }}>
                      Aquí
                    </span>
                  )}
                </div>
              )

              if (i < CONDICIONES.length - 1) {
                const lineColor = i < condicion - 1 ? '#27AE60' : 'var(--border)'
                const arrow = (
                  <div key={`a${c.num}`} style={{ flex: 1, display: 'flex', alignItems: 'center', paddingBottom: 28, minWidth: 12 }}>
                    <div style={{ flex: 1, height: 2, background: lineColor, opacity: future ? 0.25 : 1 }} />
                    <span style={{ fontSize: '0.58rem', color: lineColor, opacity: future ? 0.25 : 1, lineHeight: 1 }}>▶</span>
                  </div>
                )
                return [node, arrow]
              }
              return [node]
            })}
          </div>
        </div>
      </div>

      {/* ── Fila 3: Gráfico de barras + Fórmula ── */}
      <div className="rg-2" style={{ gap: 16 }}>

        {/* Card 3 — Gráfico de barras por condición */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span>📈</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Progreso por condición
            </span>
          </div>
          <ResponsiveContainer width="100%" height={178}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -22, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Progreso']}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text)' }}
                cursor={{ fill: 'rgba(18,140,126,0.05)' }}
              />
              <Bar dataKey="progreso" radius={[5, 5, 0, 0]} maxBarSize={34}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={barData[i].progreso === 0 ? 0.18 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {CONDICIONES.map(c => (
              <div key={c.num} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: c.num <= condicion ? 'var(--text-soft)' : 'var(--text-muted)', opacity: c.num > condicion ? 0.45 : 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                {c.name.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Card 4 — Fórmula de la condición actual */}
        <div style={{ ...card, border: `1px solid ${condicionActual.color}44` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span>📋</span>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Fórmula — {condicionActual.name}
            </span>
          </div>
          <p style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Pasos para avanzar a la siguiente condición:
          </p>
          {condicionActual.formula.map((paso, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '9px 0', borderBottom: i < condicionActual.formula.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: condicionActual.colorDim, border: `1px solid ${condicionActual.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: condicionActual.color }}>
                {i + 1}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>{paso}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
