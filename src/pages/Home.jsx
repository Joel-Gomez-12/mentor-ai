import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const CONDICIONES = [
  { num: 1, icon: '🪴', name: 'Idea Semilla', color: '#6B7280', xpMax: 100   },
  { num: 2, icon: '🌱', name: 'Nacimiento',   color: '#16A34A', xpMax: 500   },
  { num: 3, icon: '⚔️', name: 'Supervivencia',color: '#C0392B', xpMax: 1500  },
  { num: 4, icon: '📊', name: 'Estabilidad',  color: '#F39C12', xpMax: 4000  },
  { num: 5, icon: '🚀', name: 'Expansión',    color: '#3498DB', xpMax: 10000 },
  { num: 6, icon: '👑', name: 'Dominio',      color: '#27AE60', xpMax: 99999 },
]

const XP_RANGES = [
  [0,100],[100,500],[500,1500],[1500,4000],[4000,10000],[10000,99999]
]

function getSaludo() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Buenos días'
  if (h >= 12 && h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Home({ onNavigate, currentPage }) {
  const { user, xp, condicion, fullName } = useAuth()
  const nombre = fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'emprendedor'
  const [finanzas, setFinanzas] = useState({ ingresos: 0, gastos: 0, countIng: 0, countGas: 0 })
  const [loading, setLoading] = useState(true)

  const condIdx    = Math.min((condicion || 1) - 1, 5)
  const condActual = CONDICIONES[condIdx]
  const [xpMin, xpMax] = XP_RANGES[condIdx]
  const xpActual = xp || 0
  const pct = xpMax > xpMin
    ? Math.min(Math.round(((xpActual - xpMin) / (xpMax - xpMin)) * 100), 100)
    : 0

  // ─── Cargar resumen financiero del mes actual ──────────────────
  useEffect(() => {
    if (user) cargarFinanzas()
  }, [user])

  const cargarFinanzas = async () => {
    setLoading(true)
    const ahora = new Date()
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      .toISOString().split('T')[0]
    const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
      .toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('tipo, importe')
      .eq('user_id', user.id)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    if (!error && data) {
      const ingresos = data.filter(t => t.tipo === 'ingreso')
      const gastos   = data.filter(t => t.tipo === 'gasto')
      setFinanzas({
        ingresos:  ingresos.reduce((s, t) => s + parseFloat(t.importe || 0), 0),
        gastos:    gastos.reduce((s, t) => s + parseFloat(t.importe || 0), 0),
        countIng:  ingresos.length,
        countGas:  gastos.length,
      })
    }
    setLoading(false)
  }

  const balance = finanzas.ingresos - finanzas.gastos

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>

      {/* Hero Andrea */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(18,140,126,0.10), rgba(18,140,126,0.04))', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28,
        display: 'flex', alignItems: 'center', gap: 22,
        position: 'relative', overflow: 'hidden',
        boxShadow: 'var(--shadow)', marginBottom: 28
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(240,180,41,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: '2px solid rgba(18,140,126,0.5)',
          flexShrink: 0, overflow: 'hidden',
          boxShadow: '0 0 30px rgba(18,140,126,0.3)'
        }}>
          <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {getSaludo()},
          </p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', marginBottom: 6 }}>
            <span style={{ color: 'var(--gold)' }}>{nombre}</span> 👋 <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1rem' }}>soy SISI, ¿en qué nos ponemos a trabajar hoy?</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)' }}>
            Estás en condición <strong style={{ color: condActual.color }}>{condActual.icon} {condActual.name}</strong> — sigue aplicando la fórmula para avanzar.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        {[
          { icon: '⚡', label: 'Potencia mi día',        sub: 'Consulta a SISI',           page: 'sisi',      color: '#128c7e' },
          { icon: '🗂️', label: 'Vamos con el proyecto',  sub: 'Ver mis proyectos',          page: 'proyectos', color: '#3498DB' },
          { icon: '📊', label: 'Ayúdame a crecer',       sub: 'Tomar el pulso del negocio', page: 'pulso',     color: '#F39C12' },
        ].map(({ icon, label, sub, page, color }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            style={{
              flex: '1 1 140px',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', border: `1px solid ${color}33`,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}0d`; e.currentTarget.style.borderColor = `${color}66` }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = `${color}33` }}
          >
            <span style={{ fontSize: '1.3rem' }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Stat cards — datos reales */}
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        Tu estado actual
      </p>
      <div className="rg-4" style={{ gap: 14, marginBottom: 28 }}>

        {/* Condición */}
        <div style={{ background: 'var(--surface)', border: `1px solid ${condActual.color}44`, borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Condición emprendedor
          </div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: condActual.color, marginBottom: 4 }}>
            {condActual.icon} {condActual.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            Condición {condActual.num} de 6
          </div>
          <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${condActual.color}, ${condActual.color}99)`, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Próximo nivel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Próximo nivel
          </div>
          {condActual.num < 6 ? (
            <>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: CONDICIONES[condIdx + 1]?.color, marginBottom: 4 }}>
                {CONDICIONES[condIdx + 1]?.icon} {CONDICIONES[condIdx + 1]?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Faltan {(condActual.xpMax - xpActual)} XP
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#27AE60', marginBottom: 4 }}>
                👑 Nivel máximo
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Has alcanzado el Dominio
              </div>
            </>
          )}
        </div>

        {/* XP */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Experiencia (XP)
          </div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.3rem', marginBottom: 4 }}>
            {xpActual} XP
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            Próximo nivel a {xpMax} XP
          </div>
          <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--gold), #f5c04a)', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Foco */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Foco del día
          </div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--jedi)', marginBottom: 4 }}>
            {condActual.num === 1 ? 'Visibilidad' :
             condActual.num === 2 ? 'Validación' :
             condActual.num === 3 ? 'Break-even' :
             condActual.num === 4 ? 'Sistematizar' :
             condActual.num === 5 ? 'Escalar' : 'Delegar'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Según tu condición actual
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        Accesos rápidos
      </p>
      <div className="rg-4" style={{ gap: 12, marginBottom: 28 }}>
        {[
          { icon: '⚡', label: 'SISI — Análisis IA',    page: 'sisi',        color: '#128c7e' },
          { icon: '📡', label: 'Pulso del negocio',    page: 'pulso',       color: 'var(--gold)' },
          { icon: '💡', label: 'Capturar pensamiento', page: 'pensamiento', color: 'var(--indigo)' },
          { icon: '📈', label: 'Registrar ingreso',    page: 'ingreso',     color: 'var(--jedi)' },
          { icon: '📉', label: 'Registrar gasto',      page: 'gasto',       color: 'var(--leo)' },
          { icon: '🗂️', label: 'Proyectos',           page: 'proyectos',   color: 'var(--gold)' },
          { icon: '📋', label: 'Plan del negocio',     page: 'plan',        color: 'var(--andrea)' },
          { icon: '🧠', label: 'Mentores',             page: 'mentores',    color: 'var(--jedi)' },
          { icon: '🏆', label: 'Mi progreso',          page: 'progreso',    color: 'var(--indigo)' },
        ].map(({ icon, label, page, color }) => (
          <button key={page} onClick={() => onNavigate(page)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all var(--transition)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
            <span style={{ fontSize: '1.6rem' }}>{icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Resumen financiero — datos reales */}
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        Resumen financiero del mes
      </p>
      <div className="rg-3" style={{ gap: 14 }}>
        {[
          { label: 'Ingresos este mes', value: `€${finanzas.ingresos.toFixed(2)}`, sub: `${finanzas.countIng} registros`, color: 'var(--jedi)',  border: 'var(--jedi)' },
          { label: 'Gastos este mes',   value: `€${finanzas.gastos.toFixed(2)}`,   sub: `${finanzas.countGas} registros`, color: 'var(--leo)',   border: 'var(--leo)' },
          { label: 'Balance neto',      value: `€${balance.toFixed(2)}`,           sub: balance >= 0 ? '¡Positivo! Buen trabajo.' : 'Revisa tus gastos.',
            color: balance >= 0 ? 'var(--gold)' : 'var(--leo)', border: 'var(--gold)' },
        ].map(({ label, value, sub, color, border }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${border}`, borderRadius: 'var(--radius)', padding: 22 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', color, marginBottom: 4 }}>
              {loading ? '...' : value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loading ? 'Cargando...' : sub}</div>
          </div>
        ))}
      </div>

    </Layout>
  )
}