import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const MENTORES = [
  {
    key: 'pablo',
    foto: '/mentores/pablo.jpg',
    emoji: '🟡',
    name: 'Pablo',
    badge: 'Estrategia real',
    color: 'var(--gold)',
    dim: 'rgba(245,200,66,0.1)',
    desc: 'Director de Sabitek Holding. Aporta visión estratégica real desde la experiencia de haber construido y escalado negocios. Sin teoría vacía.',
    frase: '"El problema no es la falta de ideas. Es la falta de criterio para elegir una."',
    systemPrompt: `Eres Pablo Sabirón, director de Sabitek Holding y creador de Mentor AI. Tienes más de 20 años construyendo y escalando negocios reales. Hablas con la autoridad de quien lo ha vivido, no de quien lo ha estudiado.
REGLA INQUEBRANTABLE: Responde con un párrafo de EXACTAMENTE 5 oraciones. CADA ORACIÓN DEBE SER DIRECTA, ESTRATÉGICA Y CARGADA DE EXPERIENCIA REAL. Sin rodeos, sin teoría vacía, sin frases motivacionales huecas.
ESTRUCTURA DE LAS 5 ORACIONES:
1. Un diagnóstico directo y sin filtros de la situación real del emprendedor, nombrando el error estratégico concreto si lo hay.
2. El patrón que has visto repetirse en emprendedores en la misma fase y por qué la mayoría no lo supera.
3. La decisión estratégica concreta que cambiaría el resultado, con el razonamiento empresarial detrás.
4. Un paso ejecutable específico que el emprendedor puede hacer esta semana, no este mes.
5. Una advertencia directa sobre el mayor riesgo que corre si no actúa sobre esto ahora.
FORMATO: Un bloque de texto continuo. Nada de listas. El tono es el de un socio experimentado que te dice la verdad aunque no sea lo que quieres oír.`
  },
  {
    key: 'jedi',
    foto: '/mentores/jedi.jpg',
    emoji: '🧙',
    name: 'Yoda',
    badge: 'Desbloqueo inmediato',
    color: 'var(--jedi)',
    dim: 'var(--jedi-dim)',
    desc: 'Cuando estás bloqueado, Yoda va directo al problema. Sin rodeos. Te da el siguiente paso ejecutable ahora mismo.',
    frase: '"El bloqueo no está en el mercado. Está en la siguiente decisión que evitas tomar."',
    systemPrompt: `Eres Yoda, un mentor de ejecución técnica y desbloqueo inmediato. Cuando alguien está paralizado, tú vas directo al punto de bloqueo sin rodeos.
REGLA INQUEBRANTABLE: Responde con un párrafo de EXACTAMENTE 5 oraciones. CADA ORACIÓN DEBE SER CONCISA, TÉCNICA Y ORIENTADA A LA ACCIÓN INMEDIATA.
ESTRUCTURA DE LAS 5 ORACIONES:
1. Identifica con precisión quirúrgica el bloqueo real: qué tarea, decisión o conversación está evitando el emprendedor.
2. Explica por qué ese bloqueo específico está deteniendo todo lo demás (el efecto dominó).
3. Da el paso técnico más pequeño posible para romper el bloqueo hoy, no esta semana.
4. Anticipa la resistencia interna que aparecerá al intentarlo y cómo superarla.
5. Define el criterio de éxito: cómo sabrá el emprendedor que el bloqueo está resuelto.
FORMATO: No uses listas ni viñetas, solo un bloque de texto fluido. Cada oración debe sentirse como una instrucción ejecutable.`
  },
  {
    key: 'steve',
    foto: '/mentores/steve.jpg',
    emoji: '💡',
    name: 'Steve',
    badge: 'Mentor Visionario',
    color: 'var(--steve)',
    dim: 'var(--steve-dim)',
    desc: 'Piensa diferente. Te ayuda a encontrar ángulos que no habías visto, explorar ideas nuevas y construir algo que destaque.',
    frase: '"Si tu producto no se explica solo, el problema es el producto."',
    systemPrompt: `Eres Steve, un mentor visionario, minimalista y obsesionado con la excelencia y el diseño. 
REGLA INQUEBRANTABLE: Responde con un párrafo de EXACTAMENTE 5 oraciones. CADA ORACIÓN DEBE SER EXTENSA Y CARGADA DE DISCIPLINA. No permito respuestas cortas; debes describir el campo de batalla, el sudor de la estrategia y la firmeza del mando en cada frase. Usa un lenguaje épico y detallado.
ESTRUCTURA DE LAS 5 ORACIONES:
1. Una crítica constructiva y directa sobre por qué el enfoque actual es "ordinario".
2. Una visión de cómo se vería este problema si se resolviera con innovación radical.
3. Un principio de diseño o simplicidad aplicado directamente a su modelo de negocio.
4. Un paso estratégico concreto que lo diferencie del 99% de su competencia.
5. Una sentencia breve y aspiracional que lo motive a crear algo extraordinario.
FORMATO: Texto corrido sin interrupciones, enfocado en la calidad de cada palabra.`
  },
  {
    key: 'leo',
    foto: '/mentores/leo.jpg',
    emoji: '⚔️',
    name: 'Leonidas',
    badge: 'Mentor Guerrero',
    color: 'var(--leo)',
    dim: 'var(--leo-dim)',
    desc: 'Habla el idioma de los clientes. Desde el primer contacto hasta el cierre, Leonidas te entrena para vender con naturalidad.',
    frase: '"Una objeción no es un rechazo. Es una pregunta sin respuesta."',
    systemPrompt: `Eres Leonidas, un mentor guerrero con mentalidad espartana, firme y sin filtros.
REGLA INQUEBRANTABLE: Responde con EXACTAMENTE un párrafo de 5 oraciones contundentes, fuertes y disciplinadas. 
ESTRUCTURA DE LAS 5 ORACIONES:
1. Un reconocimiento seco pero honorable del desafío que el emprendedor enfrenta.
2. La identificación brutal del obstáculo real (miedo, pereza o falta de estrategia).
3. Una orden táctica sobre qué recurso o fortaleza debe movilizar ahora mismo.
4. Un consejo de resistencia mental para soportar la presión del mercado.
5. Una orden final de ejecución inmediata que no admita excusas ni demoras.
FORMATO: Un solo párrafo sólido. Cada oración debe sentirse como un golpe de autoridad.`
  },
]

export default function Mentores({ onNavigate, currentPage }) {
  const { user, idioma } = useAuth()
  const [consulta, setConsulta] = useState('')
  const [respuestas, setRespuestas] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [historial, setHistorial] = useState([])
  const [sesionAbierta, setSesionAbierta] = useState(null)
  const [mentorExpandido, setMentorExpandido] = useState(null)

  useEffect(() => {
    if (user) cargarHistorial()
  }, [user])

  const cargarHistorial = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('id, title, created_at, messages(id, role, content)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistorial(data)
  }

  // ─── Consulta grupal a los 4 mentores con Gemini ────────────────
  const obtenerConsejo = async () => {
    if (!consulta.trim()) return
    setCargando(true)
    setError(null)
    setRespuestas(null)

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

    try {
      const resultados = await Promise.all(
        MENTORES.map(async (mentor) => {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: mentor.systemPrompt + (idioma === 'en' ? '\n\nIMPORTANT: You must respond in English.' : '') }] },
              contents: [{ parts: [{ text: consulta }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 800, topP: 0.95 }
            })
          })

          if (!response.ok) {
            const err = await response.json().catch(() => ({}))
            throw new Error(err?.error?.message || `Error ${response.status}`)
          }

          const data = await response.json()
          const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta.'
          return { ...mentor, respuesta: texto }
        })
      )

      setRespuestas(resultados)

      // ─── Guardar sesión en Supabase ──────────────────────────
      const { data: session } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          mentor:  'grupal',
          title:   consulta.substring(0, 100),
        })
        .select()
        .single()

      if (session) {
        await supabase.from('messages').insert([
          { session_id: session.id, role: 'user',      content: consulta },
          ...resultados.map(r => ({
            session_id: session.id,
            role:       'assistant',
            content:    `[${r.name}]: ${r.respuesta}`,
          }))
        ])
        cargarHistorial()
      }
    } catch (err) {
      console.error('Error Gemini:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Tus mentores
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Consulta sabiduría, estrategia y fortaleza cuando la necesites.
      </p>

      {/* ── Consulta ─────────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 24 }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 14 }}>
          💬 ¿Qué reto quieres consultar?
        </p>
        <textarea
          value={consulta}
          onChange={e => setConsulta(e.target.value)}
          placeholder="Describe tu reto, duda o situación empresarial..."
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
            padding: '12px 14px', outline: 'none', resize: 'vertical',
            minHeight: 90, marginBottom: 16
          }}
        />
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: 'var(--leo)' }}>
            ⚠️ {error}
          </div>
        )}
        <button
          onClick={obtenerConsejo}
          disabled={cargando || !consulta.trim()}
          style={{
            padding: '10px 24px', borderRadius: 'var(--radius-sm)',
            background: cargando ? 'var(--surface3)' : 'var(--indigo)',
            border: 'none', color: 'white', fontWeight: 600,
            cursor: cargando || !consulta.trim() ? 'not-allowed' : 'pointer',
            fontSize: '0.88rem', opacity: cargando || !consulta.trim() ? 0.7 : 1,
            transition: 'all var(--transition)'
          }}>
          {cargando ? '⏳ Consultando mentores...' : '🧭 Obtener consejo'}
        </button>
      </div>

      {/* ── Cards de mentores (compactas, expandibles) ───────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {MENTORES.map(m => {
          const abierto = mentorExpandido === m.key
          return (
            <div key={m.key} style={{
              background: 'var(--surface)', border: `1px solid ${abierto ? m.color + '55' : 'var(--border)'}`,
              borderLeft: `3px solid ${m.color}`,
              borderRadius: 'var(--radius)', overflow: 'hidden',
              transition: 'border-color 0.2s'
            }}>
              {/* Fila compacta — siempre visible */}
              <button
                onClick={() => setMentorExpandido(abierto ? null : m.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${m.color}`, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={m.foto} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: m.color, marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.frase}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{abierto ? '▲' : '▼'}</span>
              </button>

              {/* Detalle expandido */}
              {abierto && (
                <div style={{ padding: '0 18px 18px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, background: m.dim, color: m.color, border: `1px solid ${m.color}44`, marginBottom: 12 }}>
                    {m.badge}
                  </span>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{m.desc}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Loading ───────────────────────────────────────────────── */}
      {cargando && (
        <div className="rg-3" style={{ gap: 16, marginBottom: 24 }}>
          {MENTORES.map(m => (
            <div key={m.key} style={{
              background: 'var(--surface)', border: `1px solid var(--border)`,
              borderLeft: `3px solid ${m.color}`,
              borderRadius: 'var(--radius)', padding: 20,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${m.color}`, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={m.foto} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontWeight: 700, color: m.color, fontSize: '0.9rem' }}>{m.name}</span>
              </div>
              <div style={{ height: 12, background: 'var(--surface2)', borderRadius: 99, marginBottom: 8 }} />
              <div style={{ height: 12, background: 'var(--surface2)', borderRadius: 99, width: '80%' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Respuestas IA ─────────────────────────────────────────── */}
      {respuestas && !cargando && (
        <div className="fade-in">
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Consejo de los mentores
          </p>
          <div className="rg-3" style={{ gap: 16 }}>
            {respuestas.map(m => (
              <div key={m.key} style={{
                background: 'var(--surface)', border: `1px solid var(--border)`,
                borderLeft: `3px solid ${m.color}`,
                borderRadius: 'var(--radius)', padding: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${m.color}`, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={m.foto} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontWeight: 700, color: m.color, fontSize: '0.9rem' }}>{m.name}</span>
                </div>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-soft)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "{m.respuesta}"
                </p>
              </div>
            ))}
          </div>

          {/* Nueva consulta */}
          <button
            onClick={() => { setRespuestas(null); setConsulta('') }}
            style={{ marginTop: 16, padding: '8px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem' }}>
            ➕ Nueva consulta
          </button>
        </div>
      )}

      {/* ── Historial de sesiones ─────────────────────────────────── */}
      {historial.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Historial de consultas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historial.map(s => {
              const abierta = sesionAbierta === s.id
              return (
                <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  {/* ── Header clickeable ── */}
                  <button
                    onClick={() => setSesionAbierta(abierta ? null : s.id)}
                    style={{
                      width: '100%', padding: '14px 18px', background: 'none',
                      border: 'none', cursor: 'pointer', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center', gap: 12
                    }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500, textAlign: 'left', flex: 1 }}>
                      💬 {s.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(s.created_at).toLocaleDateString('es-ES')}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {abierta ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {/* ── Respuestas expandibles ── */}
                  {abierta && (
                    <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border)' }}>
                      <div className="rg-3" style={{ gap: 10, marginTop: 14 }}>
                        {s.messages?.filter(m => m.role === 'assistant').map(msg => {
                          const nombreMentor = msg.content.match(/^\[(.+?)\]:/)?.[1]
                          const contenido    = msg.content.replace(/^\[.+?\]:\s*/, '')
                          const mentor       = MENTORES.find(m => m.name === nombreMentor)
                          if (!mentor) return null
                          return (
                            <div key={msg.id} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 12, borderLeft: `2px solid ${mentor.color}` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', border: `1px solid ${mentor.color}`, overflow: 'hidden', flexShrink: 0 }}>
                                  <img src={mentor.foto} alt={mentor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: mentor.color }}>{mentor.name}</span>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: 1.6, fontStyle: 'italic' }}>
                                "{contenido}"
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Layout>
  )
}