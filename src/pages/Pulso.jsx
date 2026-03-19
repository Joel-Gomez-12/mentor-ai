import { useState } from 'react'
import Layout from '../components/layout/Layout'

const PREGUNTAS = [
  {
    id: 'p1', pregunta: '1. ¿Cómo te sientes hoy con tu negocio?',
    chips: ['🚀 Con energía','😤 Frustrado','🧱 Bloqueado','🌊 Abrumado','😌 Tranquilo','🔥 Motivado']
  },
  {
    id: 'p2', pregunta: '2. ¿Qué ha pasado en las últimas 24 horas?',
    chips: ['💬 Hablé con clientes','💸 Cerré una venta','⚙️ Trabajé en operaciones','🚫 Perdí un cliente','🧠 Planifiqué estrategia','😓 Tuve un conflicto']
  },
  {
    id: 'p3', pregunta: '3. ¿Qué necesitas ahora?',
    chips: ['🎯 Claridad y dirección','💪 Motivación','📊 Un plan concreto','🔋 Recuperarme','🤝 Apoyo externo','⏸️ Frenar y pensar']
  },
]

export default function Pulso({ onNavigate, currentPage }) {
  const [selecciones, setSelecciones] = useState({})
  const [resultado, setResultado] = useState(null)

  const seleccionar = (id, chip) => setSelecciones(prev => ({ ...prev, [id]: chip }))

  const analizar = () => {
    setResultado({
      estado: selecciones.p1 || '—',
      foco: selecciones.p3 || '—',
      riesgo: 'Dispersión de energía',
      accion1: 'Prioriza UNA tarea crítica',
      accion2: 'Agenda revisión al final del día',
    })
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Pulso del negocio
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Andrea toma tu temperatura empresarial de hoy.
      </p>

      {!resultado ? (
        <>
          {PREGUNTAS.map(({ id, pregunta, chips }) => (
            <div key={id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 14 }}>
              <p style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.92rem' }}>{pregunta}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {chips.map(chip => (
                  <button
                    key={chip}
                    onClick={() => seleccionar(id, chip)}
                    style={{
                      padding: '7px 14px', borderRadius: 99,
                      border: `1px solid ${selecciones[id] === chip ? 'var(--indigo)' : 'var(--border2)'}`,
                      background: selecciones[id] === chip ? 'var(--indigo-dim)' : 'var(--surface2)',
                      color: selecciones[id] === chip ? 'var(--indigo)' : 'var(--text-soft)',
                      fontSize: '0.82rem', cursor: 'pointer', fontWeight: selecciones[id] === chip ? 600 : 400
                    }}
                  >{chip}</button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={analizar}
            style={{ padding: '10px 24px', borderRadius: 'var(--radius-sm)', background: 'var(--gold)', color: '#1a1000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
          >⚡ Analizar mi pulso</button>
        </>
      ) : (
        <div className="fade-in">
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            📊 Tu estado de hoy
          </p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 20 }}>
            {[
              ['Estado de hoy', resultado.estado],
              ['Foco principal', resultado.foco],
              ['Mayor riesgo', resultado.riesgo],
              ['Acción principal', resultado.accion1],
              ['Acción secundaria', resultado.accion2],
            ].map(([key, val], i, arr) => (
              <div key={key} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ minWidth: 140, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{key}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{val}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            🧭 Consejo de los mentores
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { name: 'Jedi', color: 'var(--jedi)', msg: 'Identifica el bloqueo principal y atacó con un solo golpe de claridad.' },
              { name: 'Steve', color: 'var(--steve)', msg: 'Cada obstáculo es un producto por diseñar. ¿Cuál es el problema raíz real?' },
              { name: 'Leónidas', color: 'var(--leo)', msg: 'El guerrero que conoce su estado puede dirigir su energía con precisión.' },
            ].map(({ name, color, msg }) => (
              <div key={name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${color}`, borderRadius: 'var(--radius)', padding: 18 }}>
                <div style={{ fontWeight: 700, color, marginBottom: 8 }}>{name}</div>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-soft)', lineHeight: 1.7, fontStyle: 'italic' }}>{msg}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setResultado(null); setSelecciones({}) }}
            style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.88rem' }}
          >↩ Volver a evaluar</button>
        </div>
      )}
    </Layout>
  )
}