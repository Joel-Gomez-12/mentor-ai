import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ESTADOS_UPDATE = {
  avanza:    { label: '✅ Avanza',    color: 'var(--jedi)' },
  lento:     { label: '⚠️ Lento',     color: 'var(--gold)' },
  bloqueado: { label: '🚫 Bloqueado', color: 'var(--leo)'  },
}

export default function Proyectos({ onNavigate, currentPage }) {
  const { user, agregarXP } = useAuth()
  const [vista, setVista] = useState('lista')
  const [proyectos, setProyectos] = useState([])
  const [proyectoActivo, setProyectoActivo] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', objetivo: '',
    fecha_inicio: new Date().toISOString().split('T')[0]
  })
  const [updateForm, setUpdateForm] = useState({
    estado: 'avanza', accion: '', proximo_paso: ''
  })

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif'
  }
  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 500,
    color: 'var(--text-soft)', marginBottom: 6
  }

  // ─── Cargar proyectos del usuario ───────────────────────────────────
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
    if (!error) setProyectos(data || [])
    setLoading(false)
  }

  const cargarUpdates = async (proyectoId) => {
    const { data, error } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', proyectoId)
      .order('created_at', { ascending: false })
    if (!error) setUpdates(data || [])
  }

  // ─── Crear proyecto ─────────────────────────────────────────────────
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
      await agregarXP(20)
    }
    setGuardando(false)
  }

  // ─── Seleccionar proyecto y cargar sus updates ───────────────────────
  const seleccionarProyecto = (p) => {
    setProyectoActivo(p)
    cargarUpdates(p.id)
  }

  // ─── Agregar update ──────────────────────────────────────────────────
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
      })
      .select()
      .single()

    if (!error && data) {
      setUpdates(prev => [data, ...prev])
      setUpdateForm({ estado: 'avanza', accion: '', proximo_paso: '' })
      await agregarXP(15)
    }
    setGuardando(false)
  }

  // ─── Colores por índice ──────────────────────────────────────────────
  const COLORES = ['var(--indigo)', 'var(--jedi)', 'var(--gold)', 'var(--leo)', 'var(--steve)']
  const getColor = (index) => COLORES[index % COLORES.length]

  // ─── Render ──────────────────────────────────────────────────────────
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

      {/* ── Formulario nuevo proyecto ────────────────────────────────── */}
      {vista === 'nuevo' && !proyectoActivo && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, marginBottom: 18 }}>
            Crear nuevo proyecto
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Nombre del proyecto *</label>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Mentor AI App" style={inputStyle} />
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

      {/* ── Lista de proyectos ───────────────────────────────────────── */}
      {vista === 'lista' && !proyectoActivo && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Cargando proyectos...
            </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {proyectos.map((p, i) => {
                const color = getColor(i)
                return (
                  <button key={p.id} onClick={() => seleccionarProyecto(p)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{p.nombre}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--jedi)', fontWeight: 600 }}>Activo</span>
                    </div>

                    {/* Descripción */}
                    {p.descripcion && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                        {p.descripcion}
                      </p>
                    )}

                    {/* Stats 2x2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Inicio',   value: p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-ES') : '—', color: 'var(--text)' },
                        { label: 'Objetivo', value: p.objetivo ? p.objetivo.substring(0, 20) + '...' : '—', color: 'var(--text-soft)' },
                        { label: 'Updates',  value: '—', color: 'var(--indigo)' },
                        { label: 'Estado',   value: 'Activo', color: 'var(--jedi)' },
                      ].map(({ label, value, color: c }) => (
                        <div key={label} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: c, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Vista detalle del proyecto ───────────────────────────────── */}
      {proyectoActivo && (
        <div className="fade-in">
          <button onClick={() => { setProyectoActivo(null); setUpdates([]) }}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.82rem', marginBottom: 20 }}>
            ← Volver a proyectos
          </button>

          {/* Header proyecto */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid var(--indigo)`, borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: 6 }}>
              {proyectoActivo.nombre}
            </h2>
            {proyectoActivo.objetivo && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🎯 {proyectoActivo.objetivo}</p>
            )}
          </div>

          {/* Formulario update */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 24 }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>
              Registrar actualización
            </p>

            {/* Estado chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {Object.entries(ESTADOS_UPDATE).map(([key, { label, color }]) => (
                <button key={key} onClick={() => setUpdateForm(p => ({ ...p, estado: key }))}
                  style={{
                    padding: '7px 14px', borderRadius: 99, fontSize: '0.82rem', cursor: 'pointer',
                    fontWeight: updateForm.estado === key ? 600 : 400,
                    background: updateForm.estado === key ? 'rgba(99,102,241,0.15)' : 'var(--surface2)',
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
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Próximo paso</label>
              <input value={updateForm.proximo_paso} onChange={e => setUpdateForm(p => ({ ...p, proximo_paso: e.target.value }))}
                placeholder="¿Qué harás la próxima semana?" style={inputStyle} />
            </div>

            <button onClick={agregarUpdate} disabled={guardando}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', opacity: guardando ? 0.7 : 1 }}>
              {guardando ? 'Guardando...' : '📝 Guardar update'}
            </button>
          </div>

          {/* Timeline */}
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Timeline de evolución
          </p>

          {updates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Registra tu primer update para ver la evolución.
            </p>
          ) : (
            updates.map(u => (
              <div key={u.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${ESTADOS_UPDATE[u.estado]?.color || 'var(--indigo)'}`,
                borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: ESTADOS_UPDATE[u.estado]?.color, fontWeight: 600 }}>
                    {ESTADOS_UPDATE[u.estado]?.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text)', marginBottom: u.proximo_paso ? 6 : 0 }}>
                  {u.accion}
                </p>
                {u.proximo_paso && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    → {u.proximo_paso}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  )
}