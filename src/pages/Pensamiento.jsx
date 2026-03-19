import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Pensamiento({ onNavigate, currentPage }) {
  const { user, agregarXP } = useAuth()
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState('idea')
  const [proyecto, setProyecto] = useState('General')
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [proyectos, setProyectos] = useState(['General'])
  const [loading, setLoading] = useState(true)

  // ─── Cargar datos al montar ──────────────────────────────────────────
  useEffect(() => {
    if (user) {
      cargarPensamientos()
      cargarProyectos()
    }
  }, [user])

  const cargarPensamientos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setHistorial(data || [])
    setLoading(false)
  }

  const cargarProyectos = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, nombre')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setProyectos(['General', ...data.map(p => p.nombre)])
    }
  }

  // ─── Guardar pensamiento ─────────────────────────────────────────────
  const guardar = async () => {
  if (!texto.trim()) return
  setGuardando(true)
  const { data, error } = await supabase
    .from('thoughts')
    .insert({
      user_id: user.id,
      texto,
      tipo,
      proyecto,
    })
    .select()
    .single()

  if (!error && data) {
    setHistorial(prev => [data, ...prev])
    setGuardado(true)
    await agregarXP(10)  // ← 10 XP por capturar un pensamiento
  } else {
    console.error('Error guardando pensamiento:', error)
  }
  setGuardando(false)
}

  const reset = () => {
    setTexto('')
    setTipo('idea')
    setProyecto('General')
    setGuardado(false)
  }

  const TIPO_ICONS = {
    idea: '💡', problema: '🚧', decision: '⚖️',
    preocupacion: '😟', oportunidad: '🎯', reflexion: '🧘'
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Capturar pensamiento
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Andrea guarda todo lo que pasa por tu mente.
      </p>

      {/* ── Formulario ──────────────────────────────────────────────── */}
      {!guardado ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 16 }}>
          {/* Header Andrea */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--andrea-dim)', border: '2px solid var(--andrea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
            }}>🧠</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--andrea)' }}>Andrea</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>¿En qué estás pensando ahora mismo?</div>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escribe aquí tu idea, problema, reflexión... sin filtros."
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
              padding: '12px 14px', outline: 'none', resize: 'vertical',
              minHeight: 130, marginBottom: 16
            }}
          />

          {/* Selects */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: 6 }}>
                Tipo de pensamiento
              </label>
              <select value={tipo} onChange={e => setTipo(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px', fontSize: '0.9rem', outline: 'none' }}>
                <option value="idea">💡 Idea</option>
                <option value="problema">🚧 Problema</option>
                <option value="decision">⚖️ Decisión</option>
                <option value="preocupacion">😟 Preocupación</option>
                <option value="oportunidad">🎯 Oportunidad</option>
                <option value="reflexion">🧘 Reflexión</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: 6 }}>
                Proyecto relacionado
              </label>
              <select value={proyecto} onChange={e => setProyecto(e.target.value)}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px', fontSize: '0.9rem', outline: 'none' }}>
                {proyectos.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <button onClick={guardar} disabled={guardando}
            style={{ padding: '10px 24px', borderRadius: 'var(--radius-sm)', background: 'var(--gold)', color: '#1a1000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.88rem', opacity: guardando ? 0.7 : 1 }}>
            {guardando ? 'Guardando...' : '✨ Guardar pensamiento'}
          </button>
        </div>

      ) : (
        /* ── Respuesta guardado ──────────────────────────────────── */
        <div className="fade-in" style={{ marginBottom: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 16 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', marginBottom: 20 }}>
              Pensamiento guardado. ¿Quieres escuchar qué dicen los mentores?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { name: 'Jedi',      color: 'var(--jedi)',  emoji: '🧙', msg: 'Convierte este pensamiento en una acción concreta con fecha límite.' },
                { name: 'Steve',     color: 'var(--steve)', emoji: '💡', msg: 'Cada idea merece un prototipo. ¿Cómo lo harías en 48 horas?' },
                { name: 'Leónidas', color: 'var(--leo)',   emoji: '⚔️', msg: 'El pensamiento sin acción es solo ruido. ¿Cuál es el primer paso?' },
              ].map(({ name, color, emoji, msg }) => (
                <div key={name} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderTop: `3px solid ${color}`, borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{emoji}</div>
                    <span style={{ fontWeight: 700, color, fontSize: '0.88rem' }}>{name}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.7, fontStyle: 'italic' }}>{msg}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={reset}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.88rem' }}>
              ➕ Nuevo pensamiento
            </button>
            <button onClick={() => onNavigate('progreso')}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.88rem' }}>
              🏆 Ver mi progreso
            </button>
          </div>
        </div>
      )}

      {/* ── Historial ────────────────────────────────────────────────── */}
      <div style={{ marginTop: 28 }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Pensamientos guardados
        </p>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</p>
        ) : historial.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Todavía no has guardado ningún pensamiento.
          </p>
        ) : (
          historial.map(p => (
            <div key={p.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 10,
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>
                {TIPO_ICONS[p.tipo] || '💡'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text)', marginBottom: 6, lineHeight: 1.6 }}>
                  {p.texto}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 99 }}>
                    {p.tipo}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 99 }}>
                    {p.proyecto}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(p.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}