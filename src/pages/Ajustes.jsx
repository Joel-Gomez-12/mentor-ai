import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

const MENTORES_AVATARES = [
  { key: 'andrea', emoji: '🧠', nombre: 'Andrea',   desc: 'Secretaria inteligente', color: 'var(--andrea)', dim: 'var(--andrea-dim)' },
  { key: 'jedi',   emoji: '🧙', nombre: 'Jedi',     desc: 'Mentor sabio',           color: 'var(--jedi)',   dim: 'var(--jedi-dim)' },
  { key: 'steve',  emoji: '💡', nombre: 'Steve',    desc: 'Mentor visionario',      color: 'var(--steve)',  dim: 'var(--steve-dim)' },
  { key: 'leo',    emoji: '⚔️', nombre: 'Leónidas', desc: 'Mentor guerrero',        color: 'var(--leo)',    dim: 'var(--leo-dim)' },
]

export default function Ajustes({ onNavigate, currentPage }) {
  const { signOut } = useAuth()
  const [config, setConfig] = useState({ nombre: '', sector: '', etapa: '3', moneda: 'EUR' })
  const [prefs, setPrefs] = useState({ racha: true, consejo: true, compacto: false })
  const [mentorFav, setMentorFav] = useState('jedi')
  const [saved, setSaved] = useState(false)

  const guardar = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const togglePref = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const inputStyle = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: 6 }
  const sectionTitle = { fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>Ajustes</h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>Personaliza tu experiencia en Mentor AI.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tu perfil */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>Tu perfil</p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tu nombre</label>
              <input value={config.nombre} onChange={e => setConfig(p => ({ ...p, nombre: e.target.value }))} placeholder="¿Cómo te llamas?" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tu sector / industria</label>
              <input value={config.sector} onChange={e => setConfig(p => ({ ...p, sector: e.target.value }))} placeholder="Ej: Tecnología, Salud, Educación..." style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Etapa actual del negocio</label>
              <select value={config.etapa} onChange={e => setConfig(p => ({ ...p, etapa: e.target.value }))} style={inputStyle}>
                <option value="1">Nivel 1 — Invisible</option>
                <option value="2">Nivel 2 — Caos</option>
                <option value="3">Nivel 3 — Supervivencia</option>
                <option value="4">Nivel 4 — Estabilidad</option>
                <option value="5">Nivel 5 — Crecimiento</option>
                <option value="6">Nivel 6 — Escala</option>
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Moneda</label>
              <select value={config.moneda} onChange={e => setConfig(p => ({ ...p, moneda: e.target.value }))} style={inputStyle}>
                <option value="EUR">€ Euro</option>
                <option value="USD">$ Dólar</option>
                <option value="HNL">L Lempira</option>
              </select>
            </div>
            <button onClick={guardar}
              style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)', background: saved ? 'var(--jedi)' : 'var(--indigo)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.3s' }}>
              {saved ? '✅ ¡Guardado!' : '📋 Guardar perfil'}
            </button>
          </div>

          {/* Avatares de los mentores */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>Avatares de los mentores</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Sube tus propias imágenes para personalizar cada mentor.</p>
            {MENTORES_AVATARES.map(m => (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: m.dim, border: `2px solid ${m.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.nombre}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                </div>
                <button style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--text-soft)', fontSize: '0.78rem', cursor: 'pointer'
                }}>
                  📎 Cambiar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Preferencias */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>Preferencias</p>
            {[
              { key: 'racha',   title: 'Notificaciones de racha',    desc: 'Avísame si no uso la app en 24h' },
              { key: 'consejo', title: 'Consejo del mentor al iniciar', desc: 'Muestra un consejo al abrir la app' },
              { key: 'compacto',title: 'Modo compacto',              desc: 'Reduce el espaciado de tarjetas' },
            ].map(({ key, title, desc }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.88rem', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                {/* Toggle */}
                <div
                  onClick={() => togglePref(key)}
                  style={{
                    width: 44, height: 24, borderRadius: 99, cursor: 'pointer', position: 'relative', flexShrink: 0,
                    background: prefs[key] ? 'var(--indigo)' : 'var(--surface3)',
                    border: `1px solid ${prefs[key] ? 'var(--indigo)' : 'var(--border2)'}`,
                    transition: 'all var(--transition)'
                  }}>
                  <div style={{
                    position: 'absolute', width: 18, height: 18, borderRadius: '50%',
                    background: prefs[key] ? 'white' : 'var(--text-muted)',
                    top: 2, left: prefs[key] ? 22 : 2,
                    transition: 'all var(--transition)'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Mentor principal */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>Mentor principal</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>¿A quién consultas primero ante un dilema?</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'jedi',  label: 'Jedi',     color: 'var(--jedi)' },
                { key: 'steve', label: 'Steve',    color: 'var(--steve)' },
                { key: 'leo',   label: 'Leónidas', color: 'var(--leo)' },
              ].map(m => (
                <button key={m.key} onClick={() => setMentorFav(m.key)}
                  style={{
                    padding: '7px 16px', borderRadius: 99, cursor: 'pointer', fontSize: '0.85rem',
                    background: mentorFav === m.key ? `rgba(${m.key === 'jedi' ? '52,211,153' : m.key === 'steve' ? '199,210,254' : '248,113,113'},0.15)` : 'var(--surface2)',
                    border: `1px solid ${mentorFav === m.key ? m.color : 'var(--border2)'}`,
                    color: mentorFav === m.key ? m.color : 'var(--text-soft)',
                    fontWeight: mentorFav === m.key ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zona de peligro */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>Zona de peligro</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>Estas acciones no se pueden deshacer.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['🗑️ Pensamientos', '🗑️ Ingresos', '🗑️ Gastos'].map(label => (
                <button key={label}
                  style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: '0.82rem', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
              <button
                style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--leo-dim)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--leo)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                🔴 Reset total
              </button>
            </div>
          </div>

          {/* Footer versión */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--indigo)', marginBottom: 4 }}>Mentor AI App — MVP v1.0</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Datos guardados en Supabase. Autenticación activa.</div>
          </div>

        </div>
      </div>
    </Layout>
  )
}