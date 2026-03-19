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
    respuestas: [
      'La reflexión profunda, el más poderoso de los actos es. Quien se conoce a sí mismo, no puede ser vencido.',
      'El camino correcto no siempre el más rápido es. Paciencia, y la claridad vendrá.',
      'Antes de actuar, pregúntate: ¿Hacia dónde me lleva este paso?',
    ]
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
    respuestas: [
      'Reflexionar es optimizar desde dentro. Los mejores líderes dedican tiempo a pensar, no solo a hacer.',
      'Simplifica el problema hasta su núcleo. La solución real siempre es más simple de lo que crees.',
      'La diferenciación no se encuentra copiando. ¿Qué haría alguien que no sabe que eso es imposible?',
    ]
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
    respuestas: [
      'El guerrero que no reflexiona, repite sus errores. Haz de cada lección una fortaleza.',
      'La disciplina es elegir entre lo que quieres ahora y lo que quieres más.',
      'No es el más fuerte quien gana, sino el que sigue de pie cuando todos se rinden.',
    ]
  },
]

export default function Mentores({ onNavigate, currentPage }) {
  const [consulta, setConsulta] = useState('')
  const [respuestas, setRespuestas] = useState(null)
  const [cargando, setCargando] = useState(false)

  const obtenerConsejo = () => {
    if (!consulta.trim()) return
    setCargando(true)
    setTimeout(() => {
      setRespuestas(MENTORES.map(m => ({
        ...m,
        respuesta: m.respuestas[Math.floor(Math.random() * m.respuestas.length)]
      })))
      setCargando(false)
    }, 1000)
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Tus mentores
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Consulta sabiduría, estrategia y fortaleza cuando la necesites.
      </p>

      {/* Cards de mentores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {MENTORES.map(m => (
          <div key={m.key} style={{
            background: 'var(--surface)', border: `1px solid var(--border)`,
            borderTop: `2px solid ${m.color}`,
            borderRadius: 'var(--radius)', padding: 24, textAlign: 'center',
            transition: 'all var(--transition)'
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
              border: `1px solid ${m.color}44`,
              marginBottom: 14
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

      {/* Consulta grupal */}
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
        <button
          onClick={obtenerConsejo}
          disabled={cargando}
          style={{
            padding: '10px 24px', borderRadius: 'var(--radius-sm)',
            background: 'var(--indigo)', border: 'none', color: 'white',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
            opacity: cargando ? 0.7 : 1
          }}>
          {cargando ? 'Consultando...' : '🧭 Obtener consejo'}
        </button>
      </div>

      {/* Respuestas */}
      {respuestas && (
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
        </div>
      )}
    </Layout>
  )
}