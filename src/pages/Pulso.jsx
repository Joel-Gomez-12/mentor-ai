import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const PREGUNTAS = [
  {
    id: 'ventas',
    label: '¿Cómo van tus ventas este mes?',
    opciones: [
      { valor: 'sin_ventas',   texto: 'No he vendido nada todavía' },
      { valor: 'bajando',      texto: 'Han bajado respecto al mes pasado' },
      { valor: 'estancadas',   texto: 'Igual que siempre, sin cambios' },
      { valor: 'creciendo',    texto: 'Creciendo gradualmente' },
      { valor: 'explosion',    texto: 'Crecimiento explosivo' },
      { valor: 'alto_estable', texto: 'Alto nivel sostenido' },
    ]
  },
  {
    id: 'visibilidad',
    label: '¿Cómo está tu visibilidad en el mercado?',
    opciones: [
      { valor: 'nadie_sabe',   texto: 'Nadie sabe que existo' },
      { valor: 'muy_poca',     texto: 'Muy poca presencia' },
      { valor: 'algo',         texto: 'Algo de presencia pero inconsistente' },
      { valor: 'buena',        texto: 'Buena presencia y reconocimiento' },
      { valor: 'muy_buena',    texto: 'Muy buena, muchos me conocen' },
      { valor: 'referente',    texto: 'Soy referente en mi sector' },
    ]
  },
  {
    id: 'finanzas',
    label: '¿Cómo está tu situación financiera?',
    opciones: [
      { valor: 'sin_ingresos', texto: 'Sin ingresos todavía' },
      { valor: 'crisis',       texto: 'En crisis, no llego a cubrir gastos' },
      { valor: 'justo',        texto: 'Justo para cubrir gastos' },
      { valor: 'positivo',     texto: 'Positivo con margen de maniobra' },
      { valor: 'muy_bueno',    texto: 'Muy bueno, con excedente' },
      { valor: 'abundancia',   texto: 'Abundancia total' },
    ]
  },
  {
    id: 'equipo',
    label: '¿Cómo está tu operación y equipo?',
    opciones: [
      { valor: 'solo_idea',    texto: 'Solo tengo la idea, nada más' },
      { valor: 'solo_yo',      texto: 'Solo yo, sin sistema ni equipo' },
      { valor: 'caos',         texto: 'Hay equipo pero sin orden ni procesos' },
      { valor: 'procesos',     texto: 'Tenemos procesos básicos funcionando' },
      { valor: 'sistematizado',texto: 'Sistematizado y escalable' },
      { valor: 'autonomo',     texto: 'Funciona sin que yo esté presente' },
    ]
  },
  {
    id: 'reto',
    label: '¿Cuál es tu mayor reto ahora mismo?',
    tipo: 'texto',
    placeholder: 'Ej: No consigo clientes, tengo problemas de liquidez, no sé cómo escalar...'
  },
]

const CONDICIONES_INFO = {
  1: { icon: '💀', name: 'Inexistencia',  color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  2: { icon: '🌱', name: 'Nacimiento',    color: '#16A34A', bg: 'rgba(22,163,74,0.1)'   },
  3: { icon: '⚔️', name: 'Supervivencia', color: '#C0392B', bg: 'rgba(192,57,43,0.1)'   },
  4: { icon: '📊', name: 'Estabilidad',   color: '#F39C12', bg: 'rgba(243,156,18,0.1)'  },
  5: { icon: '🚀', name: 'Expansión',     color: '#3498DB', bg: 'rgba(52,152,219,0.1)'  },
  6: { icon: '👑', name: 'Dominio',       color: '#27AE60', bg: 'rgba(39,174,96,0.1)'   },
}

export default function Pulso({ onNavigate, currentPage }) {
  const { user, agregarXP } = useAuth()
  const [respuestas, setRespuestas] = useState({})
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [historial, setHistorial] = useState([])

  const todasRespondidas = PREGUNTAS.every(p => respuestas[p.id]?.trim())

  // ─── Cargar historial al montar ──────────────────────────────
  useEffect(() => {
    if (user) cargarHistorial()
  }, [user])

  const cargarHistorial = async () => {
    const { data, error } = await supabase
      .from('pulsos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (!error) setHistorial(data || [])
  }

  const handleRespuesta = (id, valor) => {
    setRespuestas(prev => ({ ...prev, [id]: valor }))
  }

  // ─── Analizar con Gemini ────────────────────────────────────────
  const analizarPulso = async () => {
    if (!todasRespondidas) return
    setCargando(true)
    setError(null)
    setResultado(null)

    const resumenRespuestas = `
- Ventas: ${respuestas.ventas}
- Visibilidad: ${respuestas.visibilidad}
- Finanzas: ${respuestas.finanzas}
- Equipo/Operación: ${respuestas.equipo}
- Mayor reto: ${respuestas.reto}
`

    const prompt = `Eres Andrea, asistente de mentoría empresarial experta en el sistema de las 6 condiciones del emprendedor.

Las 6 fases son:
1 - INEXISTENCIA: Sin presencia, sin datos, sin ventas. El proyecto no existe en el mercado.
2 - NACIMIENTO: Primeras señales reales de interés y primeros clientes.
3 - SUPERVIVENCIA: El negocio cubre o se acerca a cubrir sus costes. Batalla por el break-even.
4 - ESTABILIDAD: El proyecto funciona con orden y repetibilidad. Ingresos predecibles.
5 - EXPANSIÓN: El sistema funciona bien y es momento de crecer con estructura.
6 - DOMINIO: Sistema autónomo. Abundancia total y sin depender del fundador.

El emprendedor ha respondido lo siguiente sobre su negocio:
${resumenRespuestas}

Analiza sus respuestas y responde EXACTAMENTE en este formato JSON sin texto adicional ni markdown:
{
  "condicion": (número del 1 al 6),
  "diagnostico": "(2-3 oraciones explicando por qué está en esa condición, siendo específico con sus respuestas)",
  "formula": ["paso 1 concreto y accionable", "paso 2 concreto y accionable", "paso 3 concreto y accionable"],
  "mensaje_andrea": "(mensaje motivador y personalizado de Andrea al emprendedor, 2 oraciones completas)",
  "alerta": "(si hay algo crítico que deba atender urgente, si no hay nada crítico escribe null)"
}`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
          })
        }
      )

      if (!response.ok) throw new Error(`Error ${response.status}`)

      const data = await response.json()
      let texto = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Extraer el bloque JSON aunque Gemini añada texto extra alrededor
      const match = texto.match(/\{[\s\S]*\}/)
      if (!match) throw new SyntaxError('No se encontró JSON en la respuesta')
      texto = match[0]

      let parsed
      try {
        parsed = JSON.parse(texto)
      } catch {
        throw new SyntaxError('La respuesta de la IA no era JSON válido')
      }

      // Validar que tenga los campos mínimos esperados
      if (!parsed.condicion || !parsed.diagnostico || !parsed.formula) {
        throw new SyntaxError('La respuesta de la IA estaba incompleta')
      }

      setResultado(parsed)
      await agregarXP(5)
      // ── Guardar en Supabase ──────────────────────────────────
      const { error: saveError } = await supabase
        .from('pulsos')
        .insert({
          user_id:        user.id,
          condicion:      parsed.condicion,
          diagnostico:    parsed.diagnostico,
          formula:        parsed.formula,
          mensaje_andrea: parsed.mensaje_andrea,
          alerta:         parsed.alerta,
          respuestas:     respuestas,
        })
      if (saveError) console.error('Error guardando pulso:', saveError)
      else cargarHistorial()


    } catch (err) {
      console.error('Error Pulso IA:', err)
      if (err instanceof SyntaxError) {
        setError('La IA devolvió una respuesta inesperada. Inténtalo de nuevo.')
      } else if (err.message.includes('Error 4')) {
        setError('Error de autenticación con la API. Revisa tu clave.')
      } else if (err.message.includes('Error 5')) {
        setError('Error en el servidor de la IA. Inténtalo en unos segundos.')
      } else {
        setError('No se pudo conectar con la IA. Revisa tu conexión.')
      }
    } finally {
      setCargando(false)
    }
  }

  const condInfo = resultado ? CONDICIONES_INFO[resultado.condicion] : null

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Pulso del negocio
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Andrea analiza tu situación real y diagnostica tu condición.
      </p>

      {!resultado ? (
        <>
          {/* Preguntas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {PREGUNTAS.map((pregunta, idx) => (
              <div key={pregunta.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
                <p style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--indigo-dim)', border: '1px solid var(--indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--indigo)', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  {pregunta.label}
                </p>

                {pregunta.tipo === 'texto' ? (
                  <textarea
                    value={respuestas[pregunta.id] || ''}
                    onChange={e => handleRespuesta(pregunta.id, e.target.value)}
                    placeholder={pregunta.placeholder}
                    style={{
                      width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem',
                      padding: '10px 14px', outline: 'none', resize: 'vertical', minHeight: 80
                    }}
                  />
                ) : (
                  <div className="rg-2" style={{ gap: 8 }}>
                    {pregunta.opciones.map(op => (
                      <button
                        key={op.valor}
                        onClick={() => handleRespuesta(pregunta.id, op.valor)}
                        style={{
                          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem',
                          transition: 'all var(--transition)',
                          background: respuestas[pregunta.id] === op.valor ? 'var(--indigo-dim)' : 'var(--surface2)',
                          border: `1px solid ${respuestas[pregunta.id] === op.valor ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                          color: respuestas[pregunta.id] === op.valor ? 'var(--text)' : 'var(--text-soft)',
                          fontWeight: respuestas[pregunta.id] === op.valor ? 600 : 400,
                        }}
                      >
                        {op.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, fontSize: '0.85rem', color: 'var(--leo)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botón analizar */}
          <button
            onClick={analizarPulso}
            disabled={cargando || !todasRespondidas}
            style={{
              padding: '12px 28px', borderRadius: 'var(--radius-sm)',
              background: todasRespondidas && !cargando ? 'var(--indigo)' : 'var(--surface3)',
              border: 'none', color: 'white', fontWeight: 600,
              cursor: todasRespondidas && !cargando ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem', opacity: todasRespondidas && !cargando ? 1 : 0.6,
              transition: 'all var(--transition)'
            }}>
            {cargando ? '⏳ Andrea está analizando tu negocio...' : '🔍 Analizar mi pulso'}
          </button>

          {!todasRespondidas && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
              Responde todas las preguntas para activar el análisis.
            </p>
          )}
          
          {/* ── Historial de pulsos ─────────────────────────────── */}
          {historial.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Historial de pulsos
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historial.map(p => {
                  const info = CONDICIONES_INFO[p.condicion]
                  return (
                    <div key={p.id} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderLeft: `3px solid ${info.color}`,
                      borderRadius: 'var(--radius-sm)', padding: '14px 18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.2rem' }}>{info.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: info.color }}>
                            Condición {p.condicion} — {info.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {p.diagnostico?.substring(0, 80)}...
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {new Date(p.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>

      ) : (
        /* ── Resultado del análisis ──────────────────────────── */
        <div className="fade-in">

          {/* Condición diagnosticada */}
          <div style={{
            background: condInfo.bg, border: `1px solid ${condInfo.color}44`,
            borderRadius: 'var(--radius)', padding: 28, marginBottom: 20,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{condInfo.icon}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: condInfo.color, marginBottom: 8 }}>
              Condición {resultado.condicion} — {condInfo.name}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 16px' }}>
              {resultado.diagnostico}
            </p>
            <span style={{ background: 'var(--surface)', border: `1px solid ${condInfo.color}44`, borderRadius: 99, padding: '4px 14px', fontSize: '0.78rem', color: condInfo.color, fontWeight: 600 }}>
              +5 XP ganados
            </span>
          </div>

          {/* Alerta crítica */}
          {resultado.alerta && resultado.alerta !== 'null' && (
            <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🚨</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#C0392B', marginBottom: 4 }}>Alerta crítica</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{resultado.alerta}</p>
              </div>
            </div>
          )}

          <div className="rg-2" style={{ gap: 16, marginBottom: 20 }}>

            {/* Fórmula de acción */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                📋 Tu fórmula de acción
              </p>
              {resultado.formula.map((paso, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < resultado.formula.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${condInfo.color}22`, border: `1.5px solid ${condInfo.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: condInfo.color, flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>{paso}</p>
                </div>
              ))}
            </div>

            {/* Mensaje de Andrea */}
            <div style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.08), rgba(240,180,41,0.03))', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 'var(--radius)', padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--andrea-dim)', border: '2px solid var(--andrea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🧠</div>
                <span style={{ fontWeight: 700, color: 'var(--andrea)', fontSize: '0.9rem' }}>Andrea</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--gold)', fontStyle: 'italic', lineHeight: 1.8 }}>
                "{resultado.mensaje_andrea}"
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => { setResultado(null); setRespuestas({}) }}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
              🔄 Nuevo análisis
            </button>
            <button onClick={() => onNavigate('progreso')}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.88rem' }}>
              🏆 Ver mi progreso
            </button>
            <button onClick={() => onNavigate('mentores')}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.88rem' }}>
              🧠 Consultar mentores
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}