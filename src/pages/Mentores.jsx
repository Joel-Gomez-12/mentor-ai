import { useState } from 'react'
import Layout from '../components/layout/Layout'

const MENTORES = [
  {
    key: 'jedi',
    emoji: '🧙',
    name: 'Jedi',
    badge: 'Mentor Sabio',
    color: 'var(--jedi)',
    dim: 'var(--jedi-dim)',
    desc: 'Prudencia, paciencia y consecuencias. Habla con la sabiduría de quien ha visto todo antes. Sus palabras van despacio, pero llegan lejos.',
    frase: '"Antes de gastar, pensar debes."',
    systemPrompt: `Eres Jedi, un mentor sabio con sabiduría ancestral y filosófica. Hablas con calma,
    paciencia y profundidad. Usas metáforas y reflexiones profundas. Das consejos concretos y accionables,
    no solo filosóficos. Siempre terminas con una pregunta o acción específica que el emprendedor debe hacer.
    IMPORTANTE: Siempre termina tus oraciones de forma completa.  Nunca dejes una oración a medias. Si te quedas sin espacio, 
    mejor escribe menos oraciones pero todas completas.`
  },
  {
    key: 'steve',
    emoji: '💡',
    name: 'Steve',
    badge: 'Mentor Visionario',
    color: 'var(--steve)',
    dim: 'var(--steve-dim)',
    desc: 'Innovación, diferenciación y visión de largo plazo. Ve las oportunidades antes que nadie. Minimalista en forma, pero extraordinario en fondo.',
    frase: '"Si tu idea no emociona, todavía no está lista."',
    systemPrompt: `Eres Steve, un mentor visionario inspirado en el pensamiento de grandes innovadores como Steve Jobs. 
    Eres directo, minimalista y enfocado en la excelencia. Ves oportunidades donde otros ven problemas. 
    Das consejos concretos sobre diferenciación, visión y estrategia. Siempre terminas con un paso de acción claro y específico.
    IMPORTANTE: Siempre termina tus oraciones de forma completa. Nunca dejes una oración a medias. Si te quedas sin espacio, 
    mejor escribe menos oraciones pero todas completas.`
  },
  {
    key: 'leo',
    emoji: '⚔️',
    name: 'Leónidas',
    badge: 'Mentor Guerrero',
    color: 'var(--leo)',
    dim: 'var(--leo-dim)',
    desc: 'Resiliencia, disciplina y fortaleza mental. No hay excusas cuando tienes una misión. Cada caída es entrenamiento para la siguiente batalla.',
    frase: '"Los días duros entrenan líderes."',
    systemPrompt: `Eres Leónidas, un mentor guerrero con mentalidad espartana. Eres duro, directo y sin excusas. 
    Crees en la disciplina absoluta, la resiliencia y la acción inmediata. No toleras las quejas ni las excusas. 
    Das pasos de acción concretos y desafías al emprendedor a actuar ya, sin demoras. 
    Siempre terminas con una orden clara de acción inmediata. 
    Responde en español con energía y determinación, entre 4 y 6 oraciones completas. Nunca cortes una oración a la mitad.`
  },
]

export default function Mentores({ onNavigate, currentPage }) {
  const [consulta, setConsulta] = useState('')
  const [respuestas, setRespuestas] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // ─── Consulta grupal a los 3 mentores con Gemini ────────────────
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
              system_instruction: { parts: [{ text: mentor.systemPrompt }] },
              contents: [{ parts: [{ text: consulta }] }],
              generationConfig: { temperature: 0.85, maxOutputTokens: 800 }
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

      {/* ── Cards de mentores ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {MENTORES.map(m => (
          <div key={m.key} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderTop: `2px solid ${m.color}`,
            borderRadius: 'var(--radius)', padding: 24, textAlign: 'center',
          }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: m.dim, border: `2px solid ${m.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 12px',
              boxShadow: `0 0 20px ${m.color}33`
            }}>{m.emoji}</div>

            {/* Nombre */}
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: m.color, marginBottom: 8 }}>
              {m.name}
            </div>

            {/* Badge */}
            <span style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: 99,
              fontSize: '0.72rem', fontWeight: 600,
              background: m.dim, color: m.color,
              border: `1px solid ${m.color}44`, marginBottom: 14
            }}>{m.badge}</span>

            {/* Descripción */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
              {m.desc}
            </p>

            {/* Frase */}
            <p style={{ fontSize: '0.82rem', color: m.color, fontStyle: 'italic' }}>
              {m.frase}
            </p>
          </div>
        ))}
      </div>

      {/* ── Consulta grupal ──────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 24 }}>
        <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          💬 Consulta a los tres mentores
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
            minHeight: 110, marginBottom: 16
          }}
        />

        {/* Error */}
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

      {/* ── Loading ───────────────────────────────────────────────── */}
      {cargando && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {MENTORES.map(m => (
            <div key={m.key} style={{
              background: 'var(--surface)', border: `1px solid var(--border)`,
              borderLeft: `3px solid ${m.color}`,
              borderRadius: 'var(--radius)', padding: 20,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.dim, border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{m.emoji}</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {respuestas.map(m => (
              <div key={m.key} style={{
                background: 'var(--surface)', border: `1px solid var(--border)`,
                borderLeft: `3px solid ${m.color}`,
                borderRadius: 'var(--radius)', padding: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: m.dim, border: `2px solid ${m.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0
                  }}>{m.emoji}</div>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Layout>
  )
}