import { useState } from 'react'
import Layout from '../components/layout/Layout'

export default function Plan({ onNavigate, currentPage }) {
  const [plan, setPlan] = useState({ anual: '', mensual: '', clientes: '', hito: '' })
  const [guardado, setGuardado] = useState(false)

  // Simulado — en Sprint 3 vendrá de Supabase
  const ingresosActuales = 500
  const objetivoMensual = parseFloat(plan.mensual) || 0
  const desviacion = objetivoMensual ? ingresosActuales - objetivoMensual : null
  const progreso = objetivoMensual ? Math.min(Math.round((ingresosActuales / objetivoMensual) * 100), 100) : 0

  const guardar = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif'
  }
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: 6 }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Plan del negocio
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Define tus objetivos. Andrea hará el seguimiento.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Izquierda — Formulario */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
            Configurar objetivos
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Objetivo anual (€)</label>
            <input type="number" value={plan.anual} onChange={e => setPlan(p => ({ ...p, anual: e.target.value }))}
              placeholder="120000" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Objetivo mensual (€)</label>
            <input type="number" value={plan.mensual} onChange={e => setPlan(p => ({ ...p, mensual: e.target.value }))}
              placeholder="10000" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Clientes objetivo (este mes)</label>
            <input type="number" value={plan.clientes} onChange={e => setPlan(p => ({ ...p, clientes: e.target.value }))}
              placeholder="5" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Hito principal del mes</label>
            <input type="text" value={plan.hito} onChange={e => setPlan(p => ({ ...p, hito: e.target.value }))}
              placeholder="Ej: Cerrar 3 demos con inversores" style={inputStyle} />
          </div>

          <button onClick={guardar}
            style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: guardado ? 'var(--jedi)' : 'var(--indigo)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.3s' }}>
            {guardado ? '✅ ¡Plan guardado!' : '📋 Guardar plan'}
          </button>
        </div>

        {/* Derecha — Seguimiento */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
              Seguimiento del mes
            </p>

            {[
              { label: 'OBJETIVO MENSUAL',  value: objetivoMensual ? `€${objetivoMensual.toFixed(2)}` : 'No definido', color: 'var(--text)' },
              { label: 'INGRESOS ACTUALES', value: `€${ingresosActuales.toFixed(2)}`, color: 'var(--jedi)' },
              { label: 'DESVIACIÓN',        value: desviacion !== null ? `${desviacion >= 0 ? '+' : ''}€${desviacion.toFixed(2)}` : '—', color: desviacion === null ? 'var(--text)' : desviacion >= 0 ? 'var(--jedi)' : 'var(--leo)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                <span style={{ fontWeight: 600, color }}>{value}</span>
              </div>
            ))}

            {/* Barra de progreso */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Progreso</span><span>{progreso}%</span>
              </div>
              <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${progreso}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--indigo), #818cf8)', transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>

          {/* Card Andrea */}
          <div style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.08) 0%, rgba(240,180,41,0.03) 100%)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--andrea-dim)', border: '2px solid var(--andrea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              🧠
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--gold)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{plan.hito ? `Tu hito del mes: ${plan.hito}. ¡Vamos a por ello!` : 'Define tus objetivos y te haré seguimiento cada día.'}"
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}