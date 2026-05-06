import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ESTADOS_UPDATE = {
  avanza:    { label: '✅ Avanza',    color: 'var(--jedi)' },
  lento:     { label: '⚠️ Lento',     color: 'var(--gold)' },
  bloqueado: { label: '🚫 Bloqueado', color: 'var(--leo)'  },
}

const PREGUNTAS_SISI = [
  { id: 'problema',    pregunta: '¿Qué problema real resuelves con este proyecto y a quién se lo resuelves exactamente?',         placeholder: 'Ej: Ayudo a autónomos a gestionar su contabilidad sin necesitar un gestor...' },
  { id: 'clientes',   pregunta: '¿Cómo vas a conseguir tus primeros clientes? ¿Tienes ya alguno interesado o validado?',          placeholder: 'Ej: Tengo 3 contactos que han mostrado interés, planeo contactar a...' },
  { id: 'diferencial',pregunta: '¿Por qué un cliente te elegiría a ti y no a la competencia? ¿Cuál es tu ventaja real?',          placeholder: 'Ej: Somos los únicos que combinamos X con Y en menos de 24h...' },
  { id: 'ingresos',   pregunta: '¿Cómo generas dinero? Describe tu modelo: precio, frecuencia de cobro, tipo de cliente.',        placeholder: 'Ej: Suscripción mensual de €99, pago único de €500, comisión del 10%...' },
  { id: 'sostenible', pregunta: '¿Cuánto necesitas ingresar al mes para que este proyecto sea sostenible para ti?',                placeholder: 'Ej: Con €2.000/mes cubriría gastos y mi sueldo mínimo...' },
  { id: 'riesgo',     pregunta: '¿Cuál es tu mayor miedo o riesgo con este proyecto ahora mismo? Sé honesto.',                    placeholder: 'Ej: No sé si el mercado está dispuesto a pagar, me preocupa la competencia...' },
]

export default function Proyectos({ onNavigate, currentPage }) {
  const { user, agregarXP, idioma } = useAuth()
  const [vista, setVista] = useState('lista')
  const [proyectos, setProyectos] = useState([])
  const [conteos, setConteos] = useState({})       // { project_id: count }
  const [proyectoActivo, setProyectoActivo] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', objetivo: '',
    fecha_inicio: new Date().toISOString().split('T')[0]
  })
  const [updateForm, setUpdateForm] = useState({
    estado: 'avanza', accion: '', proximo_paso: '', progreso: 0
  })

  // ─── Modal SISI plan de negocio ──────────────────────────────
  const [modalPlan, setModalPlan]             = useState(null)
  const [proyectoNuevo, setProyectoNuevo]     = useState(null)
  const [paso, setPaso]                       = useState(0)
  const [respuestas, setRespuestas]           = useState({})
  const [respuestaActual, setRespuestaActual] = useState('')
  const [analisisSisi, setAnalisisSisi]       = useState(null)

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif'
  }
  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 500,
    color: 'var(--text-soft)', marginBottom: 6
  }

  useEffect(() => {
    if (user) cargarProyectos()
  }, [user])

  const cargarProyectos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) {
      setProyectos(data || [])
      // Cargar conteo de updates por proyecto
      if (data && data.length > 0) {
        const ids = data.map(p => p.id)
        const { data: counts } = await supabase
          .from('project_updates')
          .select('project_id')
          .in('project_id', ids)
        if (counts) {
          const map = {}
          counts.forEach(c => { map[c.project_id] = (map[c.project_id] || 0) + 1 })
          setConteos(map)
        }
      }
    }
    setLoading(false)
  }

  const cargarUpdates = async (proyectoId) => {
    const { data } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', proyectoId)
      .order('created_at', { ascending: true })
    if (data) setUpdates(data)
  }

  const crearProyecto = async () => {
    if (!form.nombre.trim()) return
    setGuardando(true)
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        nombre: form.nombre,
        descripcion: form.descripcion,
        objetivo: form.objetivo,
        fecha_inicio: form.fecha_inicio,
      })
      .select()
      .single()

    if (!error && data) {
      setProyectos(prev => [data, ...prev])
      setForm({ nombre: '', descripcion: '', objetivo: '', fecha_inicio: new Date().toISOString().split('T')[0] })
      setVista('lista')
      await agregarXP(10)
      // Abrir modal SISI
      setProyectoNuevo(data)
      setPaso(0)
      setRespuestas({})
      setRespuestaActual('')
      setAnalisisSisi(null)
      setModalPlan('bienvenida')
    }
    setGuardando(false)
  }

  // ─── Avanzar pregunta ────────────────────────────────────────
  const responderPregunta = () => {
    if (!respuestaActual.trim()) return
    const preguntaId = PREGUNTAS_SISI[paso].id
    const nuevasRespuestas = { ...respuestas, [preguntaId]: respuestaActual }
    setRespuestas(nuevasRespuestas)
    setRespuestaActual('')
    if (paso < PREGUNTAS_SISI.length - 1) {
      setPaso(paso + 1)
    } else {
      analizarPlan(nuevasRespuestas)
    }
  }

  // ─── Llamar a Gemini para analizar el plan ───────────────────
  const analizarPlan = async (resp) => {
    setModalPlan('analizando')
    const contexto = PREGUNTAS_SISI.map(p => `${p.pregunta}\nRespuesta: ${resp[p.id] || '—'}`).join('\n\n')
    const idiomaInstruccion = idioma === 'en' ? '\nIMPORTANT: Write all text values inside the JSON in English.' : ''
    const prompt = `Eres SISI, asistente de mentoría empresarial de Mentor 1 Millón. Un emprendedor acaba de crear un proyecto y ha respondido estas preguntas sobre su plan de negocio:\n\n${contexto}\n\nNombre del proyecto: ${proyectoNuevo?.nombre}\nObjetivo: ${proyectoNuevo?.objetivo || 'No definido'}\n\nAnaliza sus respuestas y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:\n{\n  "diagnostico": "2-3 oraciones directas sobre la viabilidad real del plan",\n  "fortaleza": "El punto más sólido del plan en una oración",\n  "riesgo_principal": "El mayor riesgo o debilidad en una oración",\n  "proximos_pasos": ["paso concreto 1", "paso concreto 2", "paso concreto 3"],\n  "viabilidad": "alta" | "media" | "baja"\n}${idiomaInstruccion}`

    const fallback = {
      diagnostico: 'No pude generar el análisis en este momento. Tus respuestas han quedado guardadas y puedes continuar con el proyecto.',
      fortaleza: 'Has definido tu proyecto con claridad.',
      riesgo_principal: 'Revisa el plan manualmente cuando puedas.',
      proximos_pasos: ['Define tu primer cliente objetivo', 'Establece una fecha límite para tu primera venta', 'Registra tus avances semanales en el timeline'],
      viabilidad: 'media'
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 1000 }
          })
        }
      )
      const data = await res.json()
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const match = texto.match(/\{[\s\S]*\}/)
      const parsed = match ? JSON.parse(match[0]) : null
      const resultado = parsed || fallback
      setAnalisisSisi(resultado)

      // Guardar en Supabase (solo si la columna existe)
      await supabase.from('projects').update({
        plan_sisi: { respuestas: resp, analisis: resultado }
      }).eq('id', proyectoNuevo.id)

    } catch (err) {
      console.error('Error SISI plan:', err)
      setAnalisisSisi(fallback)
    }
    setModalPlan('resultado')
  }

  const cerrarModal = () => {
    setModalPlan(null)
    setProyectoNuevo(null)
    setPaso(0)
    setRespuestas({})
    setRespuestaActual('')
    setAnalisisSisi(null)
  }

  const seleccionarProyecto = (p) => {
    setProyectoActivo(p)
    cargarUpdates(p.id)
  }

  const agregarUpdate = async () => {
    if (!updateForm.accion.trim() || !proyectoActivo) return
    setGuardando(true)
    const { data, error } = await supabase
      .from('project_updates')
      .insert({
        project_id: proyectoActivo.id,
        estado: updateForm.estado,
        accion: updateForm.accion,
        proximo_paso: updateForm.proximo_paso,
        progreso: updateForm.progreso,
      })
      .select()
      .single()

    if (!error && data) {
      setUpdates(prev => [...prev, data])
      setConteos(prev => ({ ...prev, [proyectoActivo.id]: (prev[proyectoActivo.id] || 0) + 1 }))
      setUpdateForm({ estado: 'avanza', accion: '', proximo_paso: '', progreso: updateForm.progreso })
      await agregarXP(updateForm.estado === 'completado' ? 40 : 5)
    }
    setGuardando(false)
  }

  const COLORES = ['var(--indigo)', 'var(--jedi)', 'var(--gold)', 'var(--leo)', 'var(--steve)']
  const getColor = (index) => COLORES[index % COLORES.length]

  // Último progreso registrado en los updates
  const ultimoProgreso = updates.length > 0
    ? (updates[updates.length - 1].progreso ?? 0)
    : 0

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Proyectos
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Tus frentes activos. Todo bajo control.
          </p>
        </div>
        {!proyectoActivo && (
          <button
            onClick={() => setVista(v => v === 'nuevo' ? 'lista' : 'nuevo')}
            style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
            {vista === 'nuevo' ? '← Volver' : '+ Nuevo proyecto'}
          </button>
        )}
      </div>

      {/* ── Formulario nuevo proyecto ─────────────────────────────────── */}
      {vista === 'nuevo' && !proyectoActivo && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, marginBottom: 18 }}>Crear nuevo proyecto</p>

          <div className="rg-2" style={{ gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Nombre del proyecto *</label>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Mi proyecto principal" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))}
                style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Descripción</label>
            <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Breve descripción del proyecto" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Objetivo principal</label>
            <input value={form.objetivo} onChange={e => setForm(p => ({ ...p, objetivo: e.target.value }))}
              placeholder="¿Qué quieres lograr con este proyecto?" style={inputStyle} />
          </div>

          <button onClick={crearProyecto} disabled={guardando}
            style={{ padding: '10px 24px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', opacity: guardando ? 0.7 : 1 }}>
            {guardando ? 'Guardando...' : '🗂️ Crear proyecto'}
          </button>
        </div>
      )}

      {/* ── Lista de proyectos ────────────────────────────────────────── */}
      {vista === 'lista' && !proyectoActivo && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Cargando proyectos...</div>
          ) : proyectos.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗂️</div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, marginBottom: 8 }}>Sin proyectos aún</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Crea tu primer proyecto para empezar a hacer seguimiento.
              </p>
              <button onClick={() => setVista('nuevo')}
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                + Crear proyecto
              </button>
            </div>
          ) : (
            <div className="rg-2" style={{ gap: 16 }}>
              {proyectos.map((p, i) => {
                const color = getColor(i)
                const numUpdates = conteos[p.id] || 0
                return (
                  <button key={p.id} onClick={() => seleccionarProyecto(p)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{p.nombre}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--jedi)', fontWeight: 600 }}>Activo</span>
                    </div>

                    {p.descripcion && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                        {p.descripcion}
                      </p>
                    )}

                    <div className="rg-2" style={{ gap: 8, marginBottom: 14 }}>
                      {[
                        { label: 'Inicio',   value: p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-ES') : '—', color: 'var(--text)' },
                        { label: 'Updates',  value: numUpdates > 0 ? `${numUpdates} semana${numUpdates > 1 ? 's' : ''}` : 'Sin updates', color: numUpdates > 0 ? 'var(--indigo)' : 'var(--text-muted)' },
                      ].map(({ label, value, color: c }) => (
                        <div key={label} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: c }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Barra de progreso en la tarjeta */}
                    {p.objetivo && (
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          🎯 {p.objetivo}
                        </div>
                        <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                          <div style={{ width: '0%', height: '100%', background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Vista detalle del proyecto ────────────────────────────────── */}
      {proyectoActivo && (
        <div className="fade-in">
          <button onClick={() => { setProyectoActivo(null); setUpdates([]) }}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.82rem', marginBottom: 20 }}>
            ← Volver a proyectos
          </button>

          {/* Header proyecto con barra de progreso */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid var(--indigo)`, borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: proyectoActivo.objetivo ? 12 : 0 }}>
              <div>
                <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>
                  {proyectoActivo.nombre}
                </h2>
                {proyectoActivo.objetivo && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🎯 {proyectoActivo.objetivo}</p>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'var(--indigo)' }}>
                  {ultimoProgreso}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>progreso</div>
              </div>
            </div>

            {/* Barra de progreso principal */}
            <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 8, overflow: 'hidden', marginTop: 12 }}>
              <div style={{
                width: `${ultimoProgreso}%`, height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg, var(--indigo), var(--jedi))',
                transition: 'width 0.8s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Inicio: {proyectoActivo.fecha_inicio ? new Date(proyectoActivo.fecha_inicio).toLocaleDateString('es-ES') : '—'}</span>
              <span>{updates.length} update{updates.length !== 1 ? 's' : ''} registrado{updates.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Formulario update */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 32 }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>
              Registrar actualización semanal
            </p>

            {/* Estado chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {Object.entries(ESTADOS_UPDATE).map(([key, { label, color }]) => (
                <button key={key} onClick={() => setUpdateForm(p => ({ ...p, estado: key }))}
                  style={{
                    padding: '7px 14px', borderRadius: 99, fontSize: '0.82rem', cursor: 'pointer',
                    fontWeight: updateForm.estado === key ? 600 : 400,
                    background: updateForm.estado === key ? 'rgba(18,140,126,0.15)' : 'var(--surface2)',
                    border: `1px solid ${updateForm.estado === key ? 'var(--indigo)' : 'var(--border)'}`,
                    color: updateForm.estado === key ? color : 'var(--text-soft)'
                  }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Acción realizada *</label>
              <input value={updateForm.accion} onChange={e => setUpdateForm(p => ({ ...p, accion: e.target.value }))}
                placeholder="¿Qué avanzaste esta semana?" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Próximo paso</label>
              <input value={updateForm.proximo_paso} onChange={e => setUpdateForm(p => ({ ...p, proximo_paso: e.target.value }))}
                placeholder="¿Qué harás la próxima semana?" style={inputStyle} />
            </div>

            {/* Slider de progreso */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={labelStyle}>Progreso hacia el objetivo</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--indigo)' }}>{updateForm.progreso}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={updateForm.progreso}
                onChange={e => setUpdateForm(p => ({ ...p, progreso: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--indigo)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>

            <button onClick={agregarUpdate} disabled={guardando}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', opacity: guardando ? 0.7 : 1 }}>
              {guardando ? 'Guardando...' : '📝 Guardar update'}
            </button>
          </div>

          {/* ── Timeline visual ─────────────────────────────────────── */}
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
            Timeline de evolución
          </p>

          {updates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Registra tu primer update para ver la evolución.
            </p>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              {/* Línea vertical */}
              <div style={{
                position: 'absolute', left: 11, top: 0, bottom: 0,
                width: 2, background: 'var(--border)',
                borderRadius: 2
              }} />

              {updates.map((u, idx) => {
                const estadoInfo = ESTADOS_UPDATE[u.estado] || ESTADOS_UPDATE.avanza
                const isLast = idx === updates.length - 1
                return (
                  <div key={u.id} style={{ position: 'relative', marginBottom: isLast ? 0 : 24 }}>
                    {/* Nodo del timeline */}
                    <div style={{
                      position: 'absolute', left: -32, top: 4,
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--surface)',
                      border: `2px solid ${estadoInfo.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', zIndex: 1,
                      boxShadow: `0 0 8px ${estadoInfo.color}44`
                    }}>
                      {u.estado === 'avanza' ? '✓' : u.estado === 'lento' ? '!' : '✗'}
                    </div>

                    {/* Tarjeta del update */}
                    <div style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderLeft: `3px solid ${estadoInfo.color}`,
                      borderRadius: 'var(--radius-sm)', padding: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.82rem', color: estadoInfo.color, fontWeight: 600 }}>
                          {estadoInfo.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {u.progreso != null && (
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--indigo)' }}>
                              {u.progreso}%
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(u.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text)', marginBottom: u.proximo_paso ? 8 : 0, lineHeight: 1.5 }}>
                        {u.accion}
                      </p>

                      {u.proximo_paso && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>→</span>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                            {u.proximo_paso}
                          </p>
                        </div>
                      )}

                      {/* Mini barra de progreso en cada update */}
                      {u.progreso != null && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 3, overflow: 'hidden' }}>
                            <div style={{
                              width: `${u.progreso}%`, height: '100%', borderRadius: 99,
                              background: estadoInfo.color, transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      {/* ── Modal SISI Plan de Negocio ───────────────────────── */}
      {modalPlan && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 32, maxWidth: 560, width: '100%',
            boxShadow: 'var(--shadow-lg)', position: 'relative'
          }}>

            {/* ── Bienvenida ── */}
            {modalPlan === 'bienvenida' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(18,140,126,0.5)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 3 }}>SISI</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Acabo de ver que creaste <strong style={{ color: 'var(--indigo)' }}>{proyectoNuevo?.nombre}</strong></div>
                  </div>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 24 }}>
                  Para ayudarte mejor, me gustaría hacerte <strong style={{ color: 'var(--text)' }}>6 preguntas rápidas</strong> sobre este proyecto. Con tus respuestas analizaré su viabilidad y te daré los primeros pasos concretos.
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setModalPlan('preguntas')}
                    style={{ flex: 1, padding: '11px 0', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                    Empezar con SISI →
                  </button>
                  <button onClick={cerrarModal}
                    style={{ padding: '11px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Lo haré después
                  </button>
                </div>
              </div>
            )}

            {/* ── Preguntas ── */}
            {modalPlan === 'preguntas' && (
              <div className="fade-in">
                {/* Progreso */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  <span>Pregunta {paso + 1} de {PREGUNTAS_SISI.length}</span>
                  <span style={{ color: 'var(--indigo)', fontWeight: 600 }}>{Math.round(((paso) / PREGUNTAS_SISI.length) * 100)}% completado</span>
                </div>
                <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 4, marginBottom: 24, overflow: 'hidden' }}>
                  <div style={{ width: `${(paso / PREGUNTAS_SISI.length) * 100}%`, height: '100%', background: 'var(--indigo)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                </div>

                {/* Avatar + pregunta */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(18,140,126,0.5)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                  </div>
                  <div style={{ background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) var(--radius)', padding: '12px 16px', fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.6, flex: 1 }}>
                    {PREGUNTAS_SISI[paso].pregunta}
                  </div>
                </div>

                <textarea
                  value={respuestaActual}
                  onChange={e => setRespuestaActual(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) responderPregunta() }}
                  placeholder={PREGUNTAS_SISI[paso].placeholder}
                  rows={4}
                  autoFocus
                  style={{
                    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '12px 14px',
                    fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans, sans-serif',
                    resize: 'none', marginBottom: 16
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ctrl+Enter para avanzar</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {paso > 0 && (
                      <button onClick={() => { setPaso(paso - 1); setRespuestaActual(respuestas[PREGUNTAS_SISI[paso - 1].id] || '') }}
                        style={{ padding: '9px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem' }}>
                        ← Atrás
                      </button>
                    )}
                    <button onClick={responderPregunta} disabled={!respuestaActual.trim()}
                      style={{ padding: '9px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.88rem', cursor: respuestaActual.trim() ? 'pointer' : 'not-allowed', opacity: respuestaActual.trim() ? 1 : 0.5 }}>
                      {paso === PREGUNTAS_SISI.length - 1 ? 'Analizar plan →' : 'Siguiente →'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Analizando ── */}
            {modalPlan === 'analizando' && (
              <div className="fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(18,140,126,0.5)', overflow: 'hidden', margin: '0 auto 20px' }}>
                  <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                </div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>SISI está analizando tu plan...</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Evaluando viabilidad, riesgos y primeros pasos</p>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Resultado ── */}
            {modalPlan === 'resultado' && analisisSisi && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid rgba(18,140,126,0.5)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Análisis de SISI</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{proyectoNuevo?.nombre}</div>
                  </div>
                  {/* Badge viabilidad */}
                  <div style={{
                    marginLeft: 'auto', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                    background: analisisSisi.viabilidad === 'alta' ? 'rgba(52,211,153,0.15)' : analisisSisi.viabilidad === 'media' ? 'rgba(240,180,41,0.15)' : 'rgba(248,113,113,0.15)',
                    color: analisisSisi.viabilidad === 'alta' ? 'var(--jedi)' : analisisSisi.viabilidad === 'media' ? 'var(--gold)' : 'var(--leo)',
                    border: `1px solid ${analisisSisi.viabilidad === 'alta' ? 'var(--jedi)' : analisisSisi.viabilidad === 'media' ? 'var(--gold)' : 'var(--leo)'}44`
                  }}>
                    Viabilidad {analisisSisi.viabilidad}
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 16 }}>
                  {analisisSisi.diagnostico}
                </p>

                <div className="rg-2" style={{ gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--jedi)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>✓ Fortaleza</div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>{analisisSisi.fortaleza}</p>
                  </div>
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--leo)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>⚠ Riesgo principal</div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>{analisisSisi.riesgo_principal}</p>
                  </div>
                </div>

                {analisisSisi.proximos_pasos?.length > 0 && (
                  <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Primeros pasos</div>
                    {analisisSisi.proximos_pasos.map((paso, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < analisisSisi.proximos_pasos.length - 1 ? 8 : 0 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--indigo)', color: 'white', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>{paso}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={cerrarModal}
                  style={{ width: '100%', padding: '11px 0', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Ir al proyecto →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </Layout>
  )
}
