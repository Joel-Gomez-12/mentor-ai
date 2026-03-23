import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const MENTORES_CONFIG = [
  {
    key: 'jedi', name: 'Jedi', emoji: '🧙',
    color: 'var(--jedi)', dim: 'var(--jedi-dim)',
    systemPrompt: `Eres Jedi, un mentor sabio con sabiduría ancestral. Hablas con calma y profundidad. 
    El emprendedor acaba de capturar un pensamiento y necesita tu perspectiva. 
    Da un consejo concreto y accionable. Responde en español con 3 oraciones completas. 
    REGLA CRÍTICA: Nunca cortes una oración a la mitad. Siempre termina todas tus oraciones.`
  },
  {
    key: 'steve', name: 'Steve', emoji: '💡',
    color: 'var(--steve)', dim: 'var(--steve-dim)',
    systemPrompt: `Eres Steve, un mentor visionario inspirado en Steve Jobs. Eres directo y enfocado en la excelencia. El emprendedor acaba de capturar un pensamiento y necesita tu perspectiva innovadora. Responde en español con 3 oraciones completas. REGLA CRÍTICA: Nunca cortes una oración a la mitad. Siempre termina todas tus oraciones.`
  },
  {
    key: 'leo', name: 'Leónidas', emoji: '⚔️',
    color: 'var(--leo)', dim: 'var(--leo-dim)',
    systemPrompt: `Eres Leónidas, un mentor guerrero con mentalidad espartana. Eres duro, directo y sin excusas. El emprendedor acaba de capturar un pensamiento y necesita que lo desafíes a actuar. Responde en español con 3 oraciones completas. REGLA CRÍTICA: Nunca cortes una oración a la mitad. Siempre termina todas tus oraciones.`
  },
]

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
  const [respuestasMentores, setRespuestasMentores] = useState([])
  const [cargandoIA, setCargandoIA] = useState(false)

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

  // ─── Pedir respuestas a Gemini ────────────────────────────────
  const pedirRespuestasMentores = async (pensamientoTexto, tipoP) => {
    setCargandoIA(true)
    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

      // Últimos 5 pensamientos del historial como contexto
      const contextoHistorial = historial.slice(0, 5)
      const contextoTexto = contextoHistorial.length > 0
        ? `\n\nContexto — pensamientos recientes del emprendedor (del más reciente al más antiguo):\n` +
          contextoHistorial.map((p, i) => `${i + 1}. [${p.tipo}] "${p.texto}"`).join('\n')
        : ''

      const prompt = `El emprendedor acaba de capturar este pensamiento (tipo: ${tipoP}): "${pensamientoTexto}"${contextoTexto}\n\nSi el historial muestra un patrón recurrente, menciónalo en tu respuesta.`

      const resultados = await Promise.all(
        MENTORES_CONFIG.map(async (mentor) => {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: mentor.systemPrompt }] },
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.85, maxOutputTokens: 800 }
            })
          })

          if (!response.ok) throw new Error(`Error ${response.status}`)

          const data = await response.json()
          const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text
            || 'No pude responder en este momento.'

          return { ...mentor, respuesta }
        })
      )

      setRespuestasMentores(resultados)
    } catch (err) {
      console.error('Error IA pensamiento:', err)
      setRespuestasMentores(MENTORES_CONFIG.map(m => ({
        ...m,
        respuesta: 'No pude conectarme en este momento. Vuelve a intentarlo.'
      })))
    } finally {
      setCargandoIA(false)
    }
  }

  // ─── Guardar pensamiento ──────────────────────────────────────
  const guardar = async () => {
    if (!texto.trim()) return
    setGuardando(true)

    const { data, error } = await supabase
      .from('thoughts')
      .insert({ user_id: user.id, texto, tipo, proyecto })
      .select()
      .single()

    if (!error && data) {
      setHistorial(prev => [data, ...prev])
      setGuardado(true)
      await agregarXP(10)
      // Pedir respuestas IA en paralelo
      pedirRespuestasMentores(texto, tipo)
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
    setRespuestasMentores([])
  }

  const TIPO_ICONS = {
    idea: '💡', problema: '🚧', decision: '⚖️',
    preocupacion: '😟', oportunidad: '🎯', reflexion: '🧘'
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif'
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Capturar pensamiento
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Andrea guarda todo lo que pasa por tu mente.
      </p>

      {/* ── Formulario ─────────────────────────────────────────── */}
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
              <select value={tipo} onChange={e => setTipo(e.target.value)} style={inputStyle}>
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
              <select value={proyecto} onChange={e => setProyecto(e.target.value)} style={inputStyle}>
                {proyectos.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <button onClick={guardar} disabled={guardando || !texto.trim()}
            style={{
              padding: '10px 24px', borderRadius: 'var(--radius-sm)',
              background: 'var(--gold)', color: '#1a1000', fontWeight: 600,
              border: 'none', cursor: guardando || !texto.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem', opacity: guardando || !texto.trim() ? 0.7 : 1
            }}>
            {guardando ? 'Guardando...' : '✨ Guardar pensamiento'}
          </button>
        </div>

      ) : (
        /* ── Respuestas guardado ──────────────────────────────── */
        <div className="fade-in" style={{ marginBottom: 20 }}>
          {/* Confirmación */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.3rem' }}>✅</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>Pensamiento guardado</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>+10 XP — Los mentores están analizando tu pensamiento...</div>
            </div>
          </div>

          {/* Loading IA */}
          {cargandoIA && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
              {MENTORES_CONFIG.map(m => (
                <div key={m.key} style={{
                  background: 'var(--surface)', border: `1px solid var(--border)`,
                  borderTop: `2px solid ${m.color}`,
                  borderRadius: 'var(--radius)', padding: 18,
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.dim, border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{m.emoji}</div>
                    <span style={{ fontWeight: 700, color: m.color, fontSize: '0.85rem' }}>{m.name}</span>
                  </div>
                  <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 99, marginBottom: 8 }} />
                  <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 99, width: '75%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Respuestas IA */}
          {!cargandoIA && respuestasMentores.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
              {respuestasMentores.map(m => (
                <div key={m.key} style={{
                  background: 'var(--surface)', border: `1px solid var(--border)`,
                  borderTop: `2px solid ${m.color}`,
                  borderRadius: 'var(--radius)', padding: 18
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.dim, border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{m.emoji}</div>
                    <span style={{ fontWeight: 700, color: m.color, fontSize: '0.85rem' }}>{m.name}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.7, fontStyle: 'italic' }}>
                    "{m.respuesta}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={reset}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--gold)', border: 'none', color: '#1a1000', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
              ➕ Nuevo pensamiento
            </button>
            <button onClick={() => onNavigate('progreso')}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.88rem' }}>
              🏆 Ver mi progreso
            </button>
          </div>
        </div>
      )}

      {/* ── Historial ──────────────────────────────────────────── */}
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Layout>
  )
}