import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Plan({ onNavigate, currentPage }) {
  const { user, condicion, agregarXP } = useAuth()

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
    presupuesto_max: '',
    sueldo_objetivo: '',
  })

  const [finanzasMes, setFinanzasMes]   = useState({ ingresos: 0, gastos: 0 })
  const [proyectosActivos, setProyectosActivos] = useState(0)
  const [proyectoPlan, setProyectoPlan] = useState(null)   // proyecto principal con plan_sisi
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
      cargarProyectoPlan(),
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
        presupuesto_max:      data.presupuesto_max || '',
        sueldo_objetivo:      data.sueldo_objetivo || '',
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

  // Cargar proyecto principal con plan_sisi
  const cargarProyectoPlan = async () => {
    let { data, error } = await supabase
      .from('projects')
      .select('id, nombre, descripcion, plan_sisi, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Si plan_sisi no existe aún en la tabla, fallback sin ella
    if (error) {
      const res = await supabase
        .from('projects')
        .select('id, nombre, descripcion, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      data = res.data
    }

    if (data?.length) {
      const conPlan = data.find(p => p.plan_sisi) || null
      setProyectoPlan(conPlan)
    }
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
            generationConfig: { temperature: 0.8, maxOutputTokens: 1000 }
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
      presupuesto_max:      parseFloat(plan.presupuesto_max) || 0,
      sueldo_objetivo:      parseFloat(plan.sueldo_objetivo) || 0,
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
      await agregarXP(20)
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

  const CONDICIONES_NAMES = ['Inexistencia', 'Nacimiento', 'Supervivencia', 'Estabilidad', 'Expansión', 'Dominio']
  const CONDICIONES_COLORS = ['#6B7280', '#16A34A', '#C0392B', '#F39C12', '#3498DB', '#27AE60']
  const condIdx    = Math.min((condicion || 1) - 1, 5)
  const condColor  = CONDICIONES_COLORS[condIdx]
  const condNombre = CONDICIONES_NAMES[condIdx]

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  // ─── Modelo económico por condición ──────────────────────────
  const presupuestoMax  = parseFloat(plan.presupuesto_max) || 0
  const sueldoObjetivo  = parseFloat(plan.sueldo_objetivo) || 0
  const gastosMes       = finanzasMes.gastos
  const ingresosMes     = finanzasMes.ingresos

  // Regla del 50%: gastos + sueldo + reserva (10%) + impuestos (20% del margen estimado)
  const reservaEstimada   = sueldoObjetivo * 0.10
  const impuestosEstimados= sueldoObjetivo * 0.20
  const estructuraTotal   = gastosMes + sueldoObjetivo + reservaEstimada + impuestosEstimados
  const mitadIngresos     = ingresosMes * 0.5         // el primer 50% de lo ingresado
  const mitadObjetivo     = objMensual * 0.5          // el primer 50% del objetivo mensual
  const estructuraCubierta= mitadIngresos >= estructuraTotal
  const pctEstructura     = mitadIngresos > 0 ? Math.min((estructuraTotal / mitadIngresos) * 100, 150) : 0

  // Legado (usado en condicion <= 2)
  const pctGasto        = presupuestoMax > 0 ? Math.min((gastosMes / presupuestoMax) * 100, 150) : 0
  const superavit       = ingresosMes - estructuraTotal

  const MODELO_ECONOMICO = {
    1: { // Inexistencia
      titulo: 'Regla de oro: No gastes más de tu presupuesto',
      desc: 'En esta fase tu prioridad es validar la idea sin hundir el barco. Cada euro cuenta.',
      color: '#6B7280',
      alerta: presupuestoMax > 0 && gastosMes > presupuestoMax,
      alertaMsg: `⚠️ Has superado tu presupuesto en €${(gastosMes - presupuestoMax).toFixed(2)}`,
      ok: presupuestoMax > 0 && gastosMes <= presupuestoMax,
      okMsg: `✓ Dentro del presupuesto — quedan €${(presupuestoMax - gastosMes).toFixed(2)}`,
    },
    2: { // Nacimiento
      titulo: 'Regla de oro: No gastes más de tu presupuesto',
      desc: 'Ya tienes primeros clientes. Mantén el control del gasto mientras validas tu modelo.',
      color: '#16A34A',
      alerta: presupuestoMax > 0 && gastosMes > presupuestoMax,
      alertaMsg: `⚠️ Has superado tu presupuesto en €${(gastosMes - presupuestoMax).toFixed(2)}`,
      ok: presupuestoMax > 0 && gastosMes <= presupuestoMax,
      okMsg: `✓ Dentro del presupuesto — quedan €${(presupuestoMax - gastosMes).toFixed(2)}`,
    },
    3: { // Supervivencia
      titulo: 'Regla del 50%: Tu estructura completa debe caber en la mitad de tus ingresos',
      desc: 'Con el primer 50% de lo que ingresas debes tener cubiertos: gastos, tu sueldo, una pequeña reserva y la provisión de impuestos. A partir de ahí, empieza la segunda fase: escalar.',
      color: '#C0392B',
      alerta: !estructuraCubierta && ingresosMes > 0,
      alertaMsg: `⚠️ Tu estructura (€${estructuraTotal.toFixed(2)}) supera el 50% de tus ingresos (€${mitadIngresos.toFixed(2)})`,
      ok: estructuraCubierta,
      okMsg: `✓ Regla del 50% cumplida — el segundo 50% (€${(ingresosMes - estructuraTotal).toFixed(2)}) es libre para escalar`,
    },
    4: { // Estabilidad
      titulo: 'Objetivo: Sistematizar y mantener margen positivo',
      desc: 'Tu negocio debe funcionar con procesos, no solo con tu esfuerzo personal.',
      color: '#F39C12',
      alerta: balance < 0,
      alertaMsg: `⚠️ Balance negativo este mes: €${balance.toFixed(2)}`,
      ok: balance > 0,
      okMsg: `✓ Margen positivo: €${balance.toFixed(2)} este mes`,
    },
    5: { // Expansión
      titulo: 'Objetivo: Escalar sin depender de ti',
      desc: 'Cada acción debe multiplicar resultados. Si escalar requiere solo tu tiempo, no es escalar.',
      color: '#3498DB',
      alerta: balance < ingresosMes * 0.2,
      alertaMsg: `⚠️ Margen por debajo del 20% — revisa la estructura de costes`,
      ok: balance >= ingresosMes * 0.2,
      okMsg: `✓ Margen saludable: ${ingresosMes > 0 ? ((balance/ingresosMes)*100).toFixed(0) : 0}% sobre ingresos`,
    },
    6: { // Dominio
      titulo: 'Objetivo: El negocio funciona sin ti',
      desc: 'Tu trabajo es la visión estratégica. Si el día a día depende de ti, aún no has llegado.',
      color: '#27AE60',
      alerta: false,
      alertaMsg: '',
      ok: balance > 0,
      okMsg: `✓ Sistema generando €${balance.toFixed(2)} de margen mensual`,
    },
  }
  const modeloActual = MODELO_ECONOMICO[condicion || 1] || MODELO_ECONOMICO[1]

  // ─── Conexión con plan_sisi del proyecto ─────────────────────
  const planSisi      = proyectoPlan?.plan_sisi || null
  const respSisi      = planSisi?.respuestas    || null
  const analisisSisi  = planSisi?.analisis      || null

  // Objetivo mensual declarado en las preguntas de SISI
  const objDeclaradoSisi = (() => {
    const txt = respSisi?.sostenible || ''
    const m = txt.match(/(\d[\d.,]*)/)
    return m ? parseFloat(m[1].replace(',', '.')) : null
  })()

  // Logros y desviaciones vs plan del proyecto
  const logros = []
  const desviaciones = []
  if (objDeclaradoSisi !== null && objMensual > 0) {
    if (Math.abs(objMensual - objDeclaradoSisi) > objDeclaradoSisi * 0.1) {
      desviaciones.push(`Tu objetivo mensual (€${objMensual}) difiere del ingreso mínimo que declaraste al crear el proyecto (€${objDeclaradoSisi})`)
    } else {
      logros.push(`Objetivo mensual alineado con tu plan de negocio (€${objDeclaradoSisi})`)
    }
  }
  if (finanzasMes.ingresos > 0 && objMensual > 0) {
    if (finanzasMes.ingresos >= objMensual) {
      logros.push(`Objetivo mensual alcanzado: €${finanzasMes.ingresos.toFixed(0)} / €${objMensual}`)
    } else {
      desviaciones.push(`Ingresos al ${pctProgreso}% del objetivo mensual (€${finanzasMes.ingresos.toFixed(0)} de €${objMensual})`)
    }
  }
  if (balance < 0) desviaciones.push(`Balance negativo este mes: €${balance.toFixed(2)}`)
  else if (balance > 0 && finanzasMes.ingresos > 0) logros.push(`Balance positivo: €${balance.toFixed(2)}`)

  // Sincronizar objetivo mensual desde proyecto
  const sincronizarDesdeProyecto = () => {
    if (objDeclaradoSisi) setPlan(p => ({ ...p, objetivo_mensual: String(objDeclaradoSisi) }))
  }

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

      {/* ── Banner conexión proyecto ──────────────────────────── */}
      {proyectoPlan && (
        <div style={{
          background: planSisi
            ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(124,58,237,0.03))'
            : 'var(--surface)',
          border: `1px solid ${planSisi ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', padding: '14px 20px',
          marginBottom: 20, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>🗂️</span>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                {proyectoPlan.nombre}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                {planSisi ? '· Plan de negocio analizado por SISI' : '· Sin plan de negocio aún'}
              </span>
            </div>
            {analisisSisi?.viabilidad && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 99,
                background: analisisSisi.viabilidad === 'alta' ? 'rgba(39,174,96,0.15)' : analisisSisi.viabilidad === 'media' ? 'rgba(243,156,18,0.15)' : 'rgba(192,57,43,0.15)',
                color:      analisisSisi.viabilidad === 'alta' ? '#27AE60'               : analisisSisi.viabilidad === 'media' ? '#F39C12'               : '#C0392B',
                border:     `1px solid ${analisisSisi.viabilidad === 'alta' ? 'rgba(39,174,96,0.3)' : analisisSisi.viabilidad === 'media' ? 'rgba(243,156,18,0.3)' : 'rgba(192,57,43,0.3)'}`,
              }}>
                Viabilidad {analisisSisi.viabilidad}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {objDeclaradoSisi && (
              <button onClick={sincronizarDesdeProyecto}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: 'rgba(124,58,237,0.9)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                ⚡ Usar objetivo del proyecto (€{objDeclaradoSisi})
              </button>
            )}
            {!planSisi && (
              <button onClick={() => onNavigate('proyectos')}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>
                Ir a Proyectos →
              </button>
            )}
          </div>
        </div>
      )}

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

          {/* Logros y desviaciones vs proyecto */}
          {(logros.length > 0 || desviaciones.length > 0) && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <p style={sectionTitle}>📊 Logros y desviaciones del mes</p>
              {logros.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#27AE60', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>{l}</span>
                </div>
              ))}
              {desviaciones.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#C0392B', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>⚠</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>{d}</span>
                </div>
              ))}
              <button onClick={() => onNavigate('sisi')}
                style={{ marginTop: 8, padding: '7px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.25)', color: 'rgba(124,58,237,0.9)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                ⚡ Analizar con SISI
              </button>
            </div>
          )}

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

      {/* ── MODELO ECONÓMICO POR CONDICIÓN ───────────────────── */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <p style={{ ...sectionTitle, marginBottom: 0 }}>📐 Modelo económico — {condNombre}</p>
          <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

          {/* Tarjeta regla activa */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            border: `1px solid ${modeloActual.color}44`,
            borderTop: `3px solid ${modeloActual.color}`,
            padding: 22
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: modeloActual.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: modeloActual.color, fontSize: '0.9rem' }}>{modeloActual.titulo}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              {modeloActual.desc}
            </p>

            {/* Alerta o éxito */}
            {modeloActual.alerta && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.83rem', color: 'var(--leo)', fontWeight: 600 }}>
                {modeloActual.alertaMsg}
              </div>
            )}
            {modeloActual.ok && !modeloActual.alerta && (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.83rem', color: 'var(--jedi)', fontWeight: 600 }}>
                {modeloActual.okMsg}
              </div>
            )}
          </div>

          {/* Métricas clave según fase */}
          {(condicion <= 2) && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
              <p style={sectionTitle}>🏦 Control de presupuesto</p>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Presupuesto máximo del proyecto (€)</label>
                <input type="number"
                  value={plan.presupuesto_max}
                  onChange={e => setPlan(p => ({ ...p, presupuesto_max: e.target.value }))}
                  placeholder="Ej: 2000"
                  style={inputStyle}
                />
              </div>
              {presupuestoMax > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>Gasto actual: <strong style={{ color: pctGasto > 100 ? 'var(--leo)' : 'var(--text)' }}>€{gastosMes.toFixed(2)}</strong></span>
                    <span style={{ fontWeight: 600, color: pctGasto > 100 ? 'var(--leo)' : pctGasto > 80 ? 'var(--gold)' : 'var(--jedi)' }}>{Math.min(pctGasto, 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(pctGasto, 100)}%`, height: '100%', borderRadius: 99,
                      background: pctGasto > 100 ? 'var(--leo)' : pctGasto > 80 ? 'var(--gold)' : 'var(--jedi)',
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>€0</span><span>€{presupuestoMax.toFixed(0)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {condicion === 3 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
              <p style={sectionTitle}>⚖️ Regla del 50% — Calculadora</p>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Tu sueldo mensual mínimo (€)</label>
                <input type="number"
                  value={plan.sueldo_objetivo}
                  onChange={e => setPlan(p => ({ ...p, sueldo_objetivo: e.target.value }))}
                  placeholder="Ej: 1500"
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 5 }}>
                  La reserva (10%) e impuestos (20%) se calculan automáticamente sobre tu sueldo.
                </p>
              </div>

              {sueldoObjetivo > 0 && (
                <>
                  {/* Desglose de la estructura */}
                  <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 14 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                      Estructura total (debe caber en el primer 50%)
                    </div>
                    {[
                      { label: 'Gastos del negocio',    value: gastosMes,          color: 'var(--leo)' },
                      { label: 'Tu sueldo',             value: sueldoObjetivo,     color: 'var(--gold)' },
                      { label: 'Reserva (10%)',         value: reservaEstimada,    color: 'var(--steve)' },
                      { label: 'Provisión impuestos (20%)', value: impuestosEstimados, color: 'var(--indigo)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontWeight: 600, color, fontSize: '0.82rem' }}>€{value.toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 2 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Total estructura</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>€{estructuraTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Comparativa: estructura vs 50% ingresos */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>Estructura vs primer 50% de ingresos (€{mitadIngresos.toFixed(2)})</span>
                    <span style={{ fontWeight: 700, color: estructuraCubierta ? 'var(--jedi)' : 'var(--leo)' }}>
                      {estructuraCubierta ? '✓ OK' : `${pctEstructura.toFixed(0)}%`}
                    </span>
                  </div>
                  <div style={{ background: 'var(--surface3)', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{
                      width: `${Math.min(pctEstructura, 100)}%`, height: '100%', borderRadius: 99,
                      background: pctEstructura > 100 ? 'var(--leo)' : pctEstructura > 80 ? 'var(--gold)' : 'var(--jedi)',
                      transition: 'width 0.8s ease'
                    }} />
                  </div>

                  {/* Segundo 50% libre */}
                  {estructuraCubierta && (
                    <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.82rem', color: 'var(--jedi)' }}>
                      🚀 <strong>Segundo 50% libre: €{(ingresosMes - estructuraTotal).toFixed(2)}</strong> — listo para escalar
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {condicion >= 4 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
              <p style={sectionTitle}>📊 Métricas de crecimiento</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Ingresos del mes',  value: `€${ingresosMes.toFixed(2)}`, color: 'var(--jedi)' },
                  { label: 'Gastos del mes',    value: `€${gastosMes.toFixed(2)}`,   color: 'var(--leo)' },
                  { label: 'Margen neto',       value: `€${balance.toFixed(2)}`,      color: balance >= 0 ? 'var(--gold)' : 'var(--leo)' },
                  { label: 'Margen %',          value: ingresosMes > 0 ? `${((balance/ingresosMes)*100).toFixed(1)}%` : '—', color: 'var(--indigo)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap de condiciones */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
            <p style={sectionTitle}>🗺️ Tu evolución empresarial</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { num: 1, name: 'Inexistencia',  color: '#6B7280', regla: 'No gastes más de tu presupuesto' },
                { num: 2, name: 'Nacimiento',    color: '#16A34A', regla: 'Valida el modelo sin romper la caja' },
                { num: 3, name: 'Supervivencia', color: '#C0392B', regla: 'Alcanza el breakeven + tu sueldo' },
                { num: 4, name: 'Estabilidad',   color: '#F39C12', regla: 'Sistematiza y mantén margen positivo' },
                { num: 5, name: 'Expansión',     color: '#3498DB', regla: 'Escala sin depender de ti' },
                { num: 6, name: 'Dominio',       color: '#27AE60', regla: 'El negocio funciona sin ti' },
              ].map(fase => {
                const actual  = (condicion || 1) === fase.num
                const pasada  = (condicion || 1) > fase.num
                return (
                  <div key={fase.num} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    background: actual ? `${fase.color}15` : 'transparent',
                    border: actual ? `1px solid ${fase.color}44` : '1px solid transparent',
                    opacity: pasada ? 0.5 : 1
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: pasada ? fase.color : actual ? fase.color : 'var(--surface3)',
                      border: `2px solid ${fase.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', color: 'white', fontWeight: 700
                    }}>
                      {pasada ? '✓' : fase.num}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: actual ? 700 : 500, color: actual ? fase.color : 'var(--text-soft)' }}>
                        {fase.name} {actual && '← Aquí estás'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fase.regla}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

    </Layout>
  )
}