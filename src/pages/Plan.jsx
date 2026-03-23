import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Plan({ onNavigate, currentPage }) {
  const { user, condicion } = useAuth()

  const [plan, setPlan] = useState({
    objetivo_anual: '',
    objetivo_mensual: '',
    clientes_objetivo: '',
    hito_mes: '',
    kpi_alcance: '',
    kpi_leads: '',
    kpi_llamadas: '',
    kpi_propuestas: '',
    kpi_cierres: '',
    kpi_clientes_activos: '',
  })

  const [finanzasMes, setFinanzasMes]   = useState({ ingresos: 0, gastos: 0 })
  const [proyectosActivos, setProyectosActivos] = useState(0)
  const [ultimoPulso, setUltimoPulso]   = useState(null)
  const [loading, setLoading]           = useState(true)
  const [guardando, setGuardando]       = useState(false)
  const [guardado, setGuardado]         = useState(false)
  const [planId, setPlanId]             = useState(null)

  const mesActual  = new Date().getMonth() + 1
  const anioActual = new Date().getFullYear()
  const [mensajeAndrea, setMensajeAndrea] = useState(null)
  const [cargandoAndrea, setCargandoAndrea] = useState(false)

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif'
  }
  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 500,
    color: 'var(--text-soft)', marginBottom: 6
  }
  const sectionTitle = {
    fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16
  }

  // ─── Cargar todos los datos al montar ────────────────────────
  useEffect(() => {
    if (user) {
      cargarTodo()
    }
  }, [user])

  const cargarTodo = async () => {
    setLoading(true)
    await Promise.all([
      cargarPlanMes(),
      cargarFinanzasMes(),
      cargarProyectosActivos(),
      cargarUltimoPulso(),
    ])
    setLoading(false)
  }

  // Cargar plan del mes actual
  const cargarPlanMes = async () => {
    const { data } = await supabase
      .from('planes')
      .select('*')
      .eq('user_id', user.id)
      .eq('mes', mesActual)
      .eq('anio', anioActual)
      .maybeSingle()

    if (data) {
      setPlanId(data.id)
      setPlan({
        objetivo_anual:       data.objetivo_anual || '',
        objetivo_mensual:     data.objetivo_mensual || '',
        clientes_objetivo:    data.clientes_objetivo || '',
        hito_mes:             data.hito_mes || '',
        kpi_alcance:          data.kpi_alcance || '',
        kpi_leads:            data.kpi_leads || '',
        kpi_llamadas:         data.kpi_llamadas || '',
        kpi_propuestas:       data.kpi_propuestas || '',
        kpi_cierres:          data.kpi_cierres || '',
        kpi_clientes_activos: data.kpi_clientes_activos || '',
      })
    }
  }

  // Cargar finanzas del mes actual desde transactions
  const cargarFinanzasMes = async () => {
    const primerDia = new Date(anioActual, mesActual - 1, 1).toISOString().split('T')[0]
    const ultimoDia = new Date(anioActual, mesActual, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('transactions')
      .select('tipo, importe')
      .eq('user_id', user.id)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    if (data) {
      const ingresos = data.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + parseFloat(t.importe || 0), 0)
      const gastos   = data.filter(t => t.tipo === 'gasto').reduce((s, t) => s + parseFloat(t.importe || 0), 0)
      setFinanzasMes({ ingresos, gastos })
    }
  }

  // Cargar proyectos activos
  const cargarProyectosActivos = async () => {
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
    if (data) setProyectosActivos(data.length)
  }

  // Cargar último pulso
  const cargarUltimoPulso = async () => {
    const { data } = await supabase
      .from('pulsos')
      .select('condicion, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) setUltimoPulso(data)
  }

  const generarMensajeAndrea = async () => {
    if (!plan.objetivo_mensual) return
    setCargandoAndrea(true)

    const prompt = `Eres Andrea, asistente de mentoría empresarial.
Analiza la situación de este emprendedor y dale un mensaje motivador y concreto de máximo 2 oraciones completas.

Datos del emprendedor:
- Condición actual: ${condNombre}
- Objetivo mensual: €${plan.objetivo_mensual}
- Ingresos actuales este mes: €${finanzasMes.ingresos.toFixed(2)}
- Progreso hacia objetivo: ${pctProgreso}%
- Hito del mes: ${plan.hito_mes || 'No definido'}
- Proyectos activos: ${proyectosActivos}
- Balance neto: €${balance.toFixed(2)}

Da un mensaje directo, cálido y accionable. Menciona algo específico de sus datos. REGLA: Nunca cortes una oración a la mitad. Máximo 2 oraciones completas.`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 800 }
          })
        }
      )
      if (!response.ok) throw new Error(`Error ${response.status}`)
      const data = await response.json()
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      setMensajeAndrea(texto.trim())
    } catch (err) {
      console.error('Error Andrea:', err)
      setMensajeAndrea('No pude conectarme en este momento. Revisa tu plan y vuelve a guardar.')
    } finally {
      setCargandoAndrea(false)
    }
  }

  // ─── Guardar plan ────────────────────────────────────────────
  const guardarPlan = async () => {
    setGuardando(true)
    const payload = {
      user_id:              user.id,
      mes:                  mesActual,
      anio:                 anioActual,
      objetivo_anual:       parseFloat(plan.objetivo_anual) || 0,
      objetivo_mensual:     parseFloat(plan.objetivo_mensual) || 0,
      clientes_objetivo:    parseInt(plan.clientes_objetivo) || 0,
      hito_mes:             plan.hito_mes,
      kpi_alcance:          parseInt(plan.kpi_alcance) || 0,
      kpi_leads:            parseInt(plan.kpi_leads) || 0,
      kpi_llamadas:         parseInt(plan.kpi_llamadas) || 0,
      kpi_propuestas:       parseInt(plan.kpi_propuestas) || 0,
      kpi_cierres:          parseInt(plan.kpi_cierres) || 0,
      kpi_clientes_activos: parseInt(plan.kpi_clientes_activos) || 0,
      updated_at:           new Date().toISOString(),
    }

    let error
    if (planId) {
      // Actualizar plan existente
      const { error: updateError } = await supabase
        .from('planes')
        .update(payload)
        .eq('id', planId)
      error = updateError
    } else {
      // Crear plan nuevo
      const { data, error: insertError } = await supabase
        .from('planes')
        .insert(payload)
        .select()
        .single()
      error = insertError
      if (data) setPlanId(data.id)
    }

    if (!error) {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
      await generarMensajeAndrea() // ← genera mensaje al guardar
    } else {
      console.error('Error guardando plan:', error)
    }
    setGuardando(false)
  }

  
  // ─── Cálculos de seguimiento ─────────────────────────────────
  const objMensual   = parseFloat(plan.objetivo_mensual) || 0
  const desviacion   = objMensual ? finanzasMes.ingresos - objMensual : null
  const pctProgreso  = objMensual ? Math.min(Math.round((finanzasMes.ingresos / objMensual) * 100), 100) : 0
  const balance      = finanzasMes.ingresos - finanzasMes.gastos

  const CONDICIONES_NAMES = ['Semilla', 'Alerta Roja', 'Emergencia', 'Tracción', 'Escala', 'Dominio']
  const CONDICIONES_COLORS = ['#6B7280', '#C0392B', '#E67E22', '#F39C12', '#3498DB', '#27AE60']
  const condIdx    = Math.min((condicion || 1) - 1, 5)
  const condColor  = CONDICIONES_COLORS[condIdx]
  const condNombre = CONDICIONES_NAMES[condIdx]

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  if (loading) return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <p style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Cargando tu plan...</p>
    </Layout>
  )

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Plan del negocio
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {MESES[mesActual - 1]} {anioActual} · Define tus objetivos. Andrea hará el seguimiento.
          </p>
        </div>
        <div style={{ fontSize: '0.78rem', background: `${condColor}22`, border: `1px solid ${condColor}44`, borderRadius: 99, padding: '5px 14px', color: condColor, fontWeight: 600 }}>
          Condición actual: {condNombre}
        </div>
      </div>

      {/* ── Stats rápidos del mes ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Ingresos del mes',   value: `€${finanzasMes.ingresos.toFixed(2)}`, color: 'var(--jedi)',   icon: '📈' },
          { label: 'Gastos del mes',     value: `€${finanzasMes.gastos.toFixed(2)}`,   color: 'var(--leo)',    icon: '📉' },
          { label: 'Balance neto',       value: `€${balance.toFixed(2)}`,              color: balance >= 0 ? 'var(--gold)' : 'var(--leo)', icon: '💰' },
          { label: 'Proyectos activos',  value: proyectosActivos,                      color: 'var(--indigo)', icon: '🗂️' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{icon} {label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── COLUMNA IZQUIERDA ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Objetivos financieros */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>🎯 Objetivos financieros</p>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Objetivo anual (€)</label>
              <input type="number" value={plan.objetivo_anual}
                onChange={e => setPlan(p => ({ ...p, objetivo_anual: e.target.value }))}
                placeholder="120000" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Objetivo mensual (€)</label>
              <input type="number" value={plan.objetivo_mensual}
                onChange={e => setPlan(p => ({ ...p, objetivo_mensual: e.target.value }))}
                placeholder="10000" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Clientes objetivo (este mes)</label>
              <input type="number" value={plan.clientes_objetivo}
                onChange={e => setPlan(p => ({ ...p, clientes_objetivo: e.target.value }))}
                placeholder="5" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hito principal del mes</label>
              <input type="text" value={plan.hito_mes}
                onChange={e => setPlan(p => ({ ...p, hito_mes: e.target.value }))}
                placeholder="Ej: Cerrar 3 demos con inversores" style={inputStyle} />
            </div>
          </div>

          {/* KPIs semanales */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>📊 KPIs semanales objetivo</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { key: 'kpi_alcance',          label: 'Alcance / Visitas',    placeholder: '1000' },
                { key: 'kpi_leads',             label: 'Leads generados',      placeholder: '20'   },
                { key: 'kpi_llamadas',          label: 'Llamadas agendadas',   placeholder: '5'    },
                { key: 'kpi_propuestas',        label: 'Propuestas enviadas',  placeholder: '3'    },
                { key: 'kpi_cierres',           label: 'Cierres / Contratos',  placeholder: '1'    },
                { key: 'kpi_clientes_activos',  label: 'Clientes activos',     placeholder: '10'   },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" value={plan[key]}
                    onChange={e => setPlan(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* Botón guardar */}
          <button onClick={guardarPlan} disabled={guardando}
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: guardado ? 'var(--jedi)' : 'var(--indigo)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.3s', opacity: guardando ? 0.7 : 1 }}>
            {guardando ? 'Guardando...' : guardado ? '✅ ¡Plan guardado!' : '📋 Guardar plan'}
          </button>
        </div>

        {/* ── COLUMNA DERECHA ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Seguimiento del mes */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <p style={sectionTitle}>📈 Seguimiento del mes</p>

            {[
              {
                label: 'Objetivo mensual',
                value: objMensual ? `€${objMensual.toFixed(2)}` : 'No definido',
                color: 'var(--text)'
              },
              {
                label: 'Ingresos actuales',
                value: `€${finanzasMes.ingresos.toFixed(2)}`,
                color: 'var(--jedi)'
              },
              {
                label: 'Desviación',
                value: desviacion !== null
                  ? `${desviacion >= 0 ? '+' : ''}€${desviacion.toFixed(2)}`
                  : '—',
                color: desviacion === null ? 'var(--text)' : desviacion >= 0 ? 'var(--jedi)' : 'var(--leo)'
              },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ fontWeight: 700, color, fontSize: '0.95rem' }}>{value}</span>
              </div>
            ))}

            {/* Barra de progreso */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Progreso hacia objetivo</span>
                <span style={{ fontWeight: 600, color: pctProgreso >= 100 ? 'var(--jedi)' : 'var(--text)' }}>{pctProgreso}%</span>
              </div>
              <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${pctProgreso}%`, height: '100%', borderRadius: 99, background: pctProgreso >= 100 ? 'var(--jedi)' : 'linear-gradient(90deg, var(--indigo), #818cf8)', transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>

          {/* KPIs actuales vs objetivo */}
          {(plan.kpi_leads || plan.kpi_cierres || plan.kpi_propuestas) && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
              <p style={sectionTitle}>🎯 KPIs configurados</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Alcance / Visitas',   value: plan.kpi_alcance,         color: 'var(--indigo)' },
                  { label: 'Leads',               value: plan.kpi_leads,           color: 'var(--gold)' },
                  { label: 'Llamadas agendadas',  value: plan.kpi_llamadas,        color: 'var(--steve)' },
                  { label: 'Propuestas enviadas', value: plan.kpi_propuestas,      color: 'var(--andrea)' },
                  { label: 'Cierres',             value: plan.kpi_cierres,         color: 'var(--jedi)' },
                  { label: 'Clientes activos',    value: plan.kpi_clientes_activos,color: 'var(--indigo)' },
                ].filter(k => k.value).map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{label}</span>
                    <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color, fontSize: '0.95rem' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Último pulso */}
          {ultimoPulso && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <p style={sectionTitle}>🔍 Último pulso del negocio</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                  Condición diagnosticada: <strong style={{ color: CONDICIONES_COLORS[ultimoPulso.condicion - 1] }}>
                    {CONDICIONES_NAMES[ultimoPulso.condicion - 1]}
                  </strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {new Date(ultimoPulso.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
              <button onClick={() => onNavigate('pulso')}
                style={{ marginTop: 12, padding: '7px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.78rem' }}>
                🔄 Hacer nuevo pulso
              </button>
            </div>
          )}

          {/* Mensaje Andrea */}
          <div style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.08), rgba(240,180,41,0.03))', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--andrea-dim)', border: '2px solid var(--andrea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              🧠
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--gold)', fontStyle: 'italic', lineHeight: 1.6 }}>
              {cargandoAndrea
                ? '⏳ Andrea está analizando tu plan...'
                : mensajeAndrea
                  ? `"${mensajeAndrea}"`
                  : `"${plan.hito_mes
                      ? `Tu hito del mes: "${plan.hito_mes}". Guarda tu plan para que te dé seguimiento personalizado.`
                      : 'Define tus objetivos y guarda el plan para recibir mi análisis personalizado.'}"`
              }
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}