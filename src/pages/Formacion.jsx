import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ─── Contenido de las 9 verticales ────────────────────────────────────────────
const VERTICALES = [
  {
    id: 'fiscal',
    icon: '🏛️',
    color: '#6366F1',
    titulo: 'Gestión fiscal e impuestos',
    desc: 'Aprende a gestionar tus obligaciones fiscales como emprendedor.',
    lecciones: [
      {
        id: 'fiscal-1',
        titulo: 'Entendiendo las obligaciones fiscales',
        contenido: 'Todo negocio tiene obligaciones fiscales que varían según el país y la estructura jurídica elegida. Es fundamental entender qué impuestos aplican a tu actividad: impuesto sobre la renta, impuestos sobre ventas/valor añadido, retenciones, y cotizaciones sociales. Consulta con un asesor fiscal local para conocer tus obligaciones específicas.',
      },
      {
        id: 'fiscal-2',
        titulo: 'Planificación fiscal básica',
        contenido: 'La planificación fiscal no es evasión, es inteligencia financiera. Separa desde el primer día una cuenta exclusiva para impuestos y aparta entre el 25% y el 30% de cada ingreso. Lleva un registro mensual de ingresos y gastos deducibles. La organización preventiva evita sustos al final del trimestre.',
      },
      {
        id: 'fiscal-3',
        titulo: 'Facturación y documentación',
        contenido: 'Una factura correcta debe incluir: número de factura correlativo, fecha de emisión, datos del emisor y receptor (nombre, NIF/CIF, dirección), descripción del servicio o producto, base imponible, tipo de IVA aplicado y total. Guarda todas tus facturas de gastos: son la base de tus deducciones fiscales.',
      },
    ],
    quiz: [
      { pregunta: '¿Cuál es la mejor práctica para gestionar impuestos?', opciones: ['Improvisar cada trimestre', 'Hacer provisiones mensuales', 'Ignorarlos hasta fin de año'], correcta: 1 },
      { pregunta: '¿Qué debes separar siempre?', opciones: ['Cuentas personales y de negocio', 'Ingresos y gastos', 'Clientes nuevos y antiguos'], correcta: 0 },
    ],
  },
  {
    id: 'equipo',
    icon: '👥',
    color: '#8B5CF6',
    titulo: 'Construir equipo',
    desc: 'Cómo encontrar, contratar y liderar a las personas correctas.',
    lecciones: [
      {
        id: 'equipo-1',
        titulo: 'Cuándo contratar tu primer empleado',
        contenido: 'El primer contrato es una decisión estratégica, no solo operativa. Contrata cuando el coste del empleado sea menor que el valor que genera, o cuando tu tiempo en tareas operativas te impida crecer. Antes de contratar, documenta claramente el rol, las responsabilidades y los indicadores de éxito del puesto.',
      },
      {
        id: 'equipo-2',
        titulo: 'Proceso de selección efectivo',
        contenido: 'Un buen proceso de selección tiene tres fases: atracción (dónde publicas y cómo describes el puesto), filtro (preguntas específicas sobre situaciones reales) y decisión (prueba práctica). Contrata por actitud y valores, forma en habilidades técnicas. Una mala contratación cuesta entre 3 y 6 veces el salario anual del puesto.',
      },
      {
        id: 'equipo-3',
        titulo: 'Cultura de equipo desde el día uno',
        contenido: 'La cultura no se declara, se demuestra con comportamientos diarios. Define 3 o 4 valores concretos y no negociables. Crea rituales de equipo: reuniones semanales de estado, celebración de logros, feedback regular. Un equipo con cultura clara toma mejores decisiones sin necesitar supervisión constante.',
      },
    ],
    quiz: [
      { pregunta: '¿Cuándo es el momento correcto para contratar?', opciones: ['Cuando el negocio empieza', 'Cuando el coste es menor que el valor generado', 'Cuando tienes tiempo libre'], correcta: 1 },
      { pregunta: '¿Qué prioridad debes tener al contratar?', opciones: ['Experiencia técnica', 'Actitud y valores', 'Salario bajo'], correcta: 1 },
    ],
  },
  {
    id: 'modelos',
    icon: '🗂️',
    color: '#F59E0B',
    titulo: 'Modelos de negocio',
    desc: 'Encuentra el modelo que mejor se adapta a tu negocio.',
    lecciones: [
      {
        id: 'modelos-1',
        titulo: 'Qué es un modelo de negocio',
        contenido: 'Un modelo de negocio describe cómo tu empresa crea, entrega y captura valor. No es el producto ni el servicio: es la lógica completa de cómo ganas dinero. Los 9 bloques del Business Model Canvas (clientes, propuesta de valor, canales, relaciones, fuentes de ingreso, recursos, actividades, socios y costes) te dan una visión completa.',
      },
      {
        id: 'modelos-2',
        titulo: 'Modelos de ingresos recurrentes vs transaccionales',
        contenido: 'Los modelos transaccionales generan ingresos por cada venta individual: tienda, consultoría por proyecto, freelance. Los recurrentes generan ingresos continuos: suscripciones, retainers, licencias. Los negocios más valiosos combinan ambos: una entrada transaccional y una retención recurrente. Apunta a tener al menos el 30% de tus ingresos en formato recurrente.',
      },
      {
        id: 'modelos-3',
        titulo: 'Cómo escalar tu modelo actual',
        contenido: 'Escalar significa crecer el ingreso sin crecer proporcionalmente los costes. Para escalar, primero sistematiza: documenta los procesos que generan valor. Segundo, automatiza lo automatizable. Tercero, apalanca: usa el tiempo de otros (empleados, partners, tecnología). Un negocio escalable tiene márgenes que mejoran con el volumen.',
      },
    ],
    quiz: [
      { pregunta: '¿Qué describe un modelo de negocio?', opciones: ['Solo el producto', 'Cómo se crea, entrega y captura valor', 'El plan de marketing'], correcta: 1 },
      { pregunta: '¿Qué tipo de ingreso aporta más estabilidad?', opciones: ['Transaccional', 'Recurrente', 'Por proyecto'], correcta: 1 },
    ],
  },
  {
    id: 'juridica',
    icon: '⚖️',
    color: '#10B981',
    titulo: 'Estructura jurídica',
    desc: 'Elige la estructura legal correcta para tu negocio.',
    lecciones: [
      {
        id: 'juridica-1',
        titulo: 'Autónomo vs Sociedad Limitada',
        contenido: 'El autónomo es la forma más simple: tributas en IRPF sobre todos tus beneficios con una escala progresiva que puede llegar al 47%. La Sociedad Limitada tributa al 25% en Impuesto de Sociedades y protege tu patrimonio personal. El punto de inflexión suele estar entre 40.000€ y 50.000€ de beneficio neto anual. Antes de ese umbral, el autónomo suele ser más eficiente.',
      },
      {
        id: 'juridica-2',
        titulo: 'Protección del patrimonio personal',
        contenido: 'Una de las ventajas clave de crear una sociedad es la responsabilidad limitada: en caso de deudas, el acreedor solo puede ir contra el patrimonio de la empresa, no contra el tuyo personal (casa, cuentas privadas). Hay excepciones: avales personales, deudas fiscales o de Seguridad Social. Nunca avales como persona física si puedes evitarlo.',
      },
    ],
    quiz: [
      { pregunta: '¿A partir de qué beneficio suele convenir una SL?', opciones: ['Desde el primer euro', 'Entre 40.000€ y 50.000€', 'Nunca'], correcta: 1 },
      { pregunta: '¿Qué protege la responsabilidad limitada?', opciones: ['Las deudas fiscales', 'Tu patrimonio personal', 'Las deudas con empleados'], correcta: 1 },
    ],
  },
  {
    id: 'ventas',
    icon: '🤝',
    color: '#EF4444',
    titulo: 'Ventas y cierre',
    desc: 'Domina el arte de vender y cerrar clientes.',
    lecciones: [
      {
        id: 'ventas-1',
        titulo: 'El proceso de venta en 5 pasos',
        contenido: 'Toda venta profesional sigue un proceso: 1) Prospección (identificar clientes potenciales), 2) Cualificación (confirmar que tienen el problema, el dinero y la autoridad de decisión), 3) Presentación (mostrar cómo tu solución resuelve su problema específico), 4) Manejo de objeciones (transformar dudas en confirmaciones), 5) Cierre (pedir la decisión). Saltarse algún paso es la causa más común de pérdida de ventas.',
      },
      {
        id: 'ventas-2',
        titulo: 'Cómo manejar objeciones',
        contenido: 'Una objeción no es un rechazo: es una petición de más información. Las cuatro objeciones más comunes son precio ("es muy caro"), tiempo ("no es el momento"), confianza ("no te conozco") y necesidad ("no lo necesito ahora"). Para cada una, la respuesta correcta empieza por validar ("entiendo perfectamente"), luego preguntar para profundizar, y finalmente reencuadrar desde el valor.',
      },
      {
        id: 'ventas-3',
        titulo: 'Técnicas de cierre efectivas',
        contenido: 'El cierre más efectivo es el cierre directo: simplemente preguntar "¿Seguimos adelante?" o "¿Empezamos la semana que viene?". El cierre de alternativas da opciones equivalentes: "¿Prefieres el plan mensual o el anual?". El cierre de urgencia funciona cuando hay una razón real: "Esta semana tengo un hueco, después estaré lleno hasta el mes que viene". Nunca presiones sin valor real detrás.',
      },
    ],
    quiz: [
      { pregunta: '¿Qué es una objeción de venta?', opciones: ['Un rechazo definitivo', 'Una petición de más información', 'Una señal de no interés'], correcta: 1 },
      { pregunta: '¿Cuál es el cierre más directo?', opciones: ['Dar un descuento', 'Preguntar "¿Seguimos adelante?"', 'Enviar un email de seguimiento'], correcta: 1 },
    ],
  },
  {
    id: 'finanzas',
    icon: '📊',
    color: '#3B82F6',
    titulo: 'Finanzas para emprendedores',
    desc: 'Gestiona el dinero de tu negocio con inteligencia.',
    lecciones: [
      {
        id: 'finanzas-1',
        titulo: 'Los 3 estados financieros que debes entender',
        contenido: 'Todo emprendedor debe leer tres documentos: la Cuenta de Resultados (ingresos – gastos = beneficio o pérdida), el Balance (activos vs pasivos + patrimonio neto) y el Flujo de Caja (dinero que entra y sale realmente). Un negocio puede ser rentable en la cuenta de resultados y quebrar por falta de liquidez en el flujo de caja. La caja es la realidad; el beneficio contable es una opinión.',
      },
      {
        id: 'finanzas-2',
        titulo: 'Break-even: el punto de equilibrio',
        contenido: 'El punto de equilibrio es el nivel de ventas en el que tus ingresos cubren exactamente todos tus costes, fijos y variables. Por debajo de ese punto pierdes dinero; por encima, ganas. La fórmula es: Break-even = Costes fijos / (1 - Costes variables / Ingresos). Conocer tu break-even te da claridad sobre cuánto necesitas vender cada mes para sobrevivir.',
      },
      {
        id: 'finanzas-3',
        titulo: 'Cómo gestionar el flujo de caja',
        contenido: 'El flujo de caja es el oxígeno del negocio. Reglas básicas: cobra antes de pagar cuando puedas, negocia plazos de pago con proveedores más largos que los de cobro con clientes, mantén una reserva de 3 meses de costes fijos, y haz previsiones de caja a 90 días. El 82% de los negocios que quiebran lo hacen por problemas de liquidez, no por falta de rentabilidad.',
      },
    ],
    quiz: [
      { pregunta: '¿Cuál es el documento que muestra el dinero real en caja?', opciones: ['Balance', 'Cuenta de resultados', 'Flujo de caja'], correcta: 2 },
      { pregunta: '¿Qué indica el break-even?', opciones: ['El máximo beneficio posible', 'El punto donde ingresos = costes', 'El límite de deuda'], correcta: 1 },
    ],
  },
  {
    id: 'marketing',
    icon: '📣',
    color: '#F97316',
    titulo: 'Marketing y captación',
    desc: 'Atrae clientes de forma consistente y escalable.',
    lecciones: [
      {
        id: 'marketing-1',
        titulo: 'Define tu cliente ideal (ICP)',
        contenido: 'El Ideal Customer Profile es el perfil detallado del cliente que más se beneficia de tu oferta y que más valor genera para tu negocio. Incluye datos demográficos (edad, cargo, sector, tamaño de empresa), pero sobre todo psicográficos: qué problema tiene, qué ya ha intentado, qué miedos le frenan, qué resultado desea. Cuanto más específico sea tu ICP, más efectivas serán todas tus acciones de marketing.',
      },
      {
        id: 'marketing-2',
        titulo: 'Los canales de adquisición que funcionan',
        contenido: 'No todos los canales funcionan igual para todos los negocios. Los principales son: contenido orgánico (SEO, redes sociales), publicidad de pago (Google Ads, Meta Ads), referidos (boca a boca sistematizado), partnerships (acuerdos con negocios complementarios) y outbound (contacto directo con prospectos). Elige uno o dos canales, domínalos completamente antes de diversificar.',
      },
      {
        id: 'marketing-3',
        titulo: 'Funnel de ventas básico',
        contenido: 'Un funnel básico tiene tres etapas: TOFU (Top of Funnel) — generar atención y tráfico con contenido de valor; MOFU (Middle of Funnel) — convertir visitantes en leads con algo de valor a cambio de sus datos; BOFU (Bottom of Funnel) — convertir leads en clientes con una oferta específica y seguimiento. Mide la conversión en cada etapa para saber dónde optimizar.',
      },
    ],
    quiz: [
      { pregunta: '¿Qué es el ICP?', opciones: ['Un tipo de anuncio', 'El perfil del cliente ideal', 'Una métrica de ventas'], correcta: 1 },
      { pregunta: '¿Cuántos canales deberías dominar primero?', opciones: ['Todos los posibles', 'Uno o dos', 'Al menos cinco'], correcta: 1 },
    ],
  },
  {
    id: 'liderazgo',
    icon: '🏅',
    color: '#EC4899',
    titulo: 'Liderazgo y relaciones',
    desc: 'Desarrolla las habilidades blandas que definen a los grandes líderes.',
    lecciones: [
      {
        id: 'liderazgo-1',
        titulo: 'Liderazgo vs gestión: la diferencia clave',
        contenido: 'Gestionar es asegurarse de que las cosas se hacen correctamente. Liderar es asegurarse de que se hacen las cosas correctas. Un gestor controla procesos; un líder inspira dirección. En las primeras etapas del negocio necesitas las dos habilidades, pero a medida que creces, el liderazgo se vuelve crítico: tu capacidad de inspirar y alinear a otros determina el techo de tu empresa.',
      },
      {
        id: 'liderazgo-2',
        titulo: 'Comunicación efectiva con tu equipo',
        contenido: 'La comunicación efectiva tiene cuatro elementos: claridad (que el mensaje sea inequívoco), contexto (que el receptor entienda el "por qué"), feedback (confirmar que se ha entendido correctamente) y consistencia (repetir los mensajes importantes más veces de lo que crees necesario). El error más común es asumir que porque tú lo tienes claro, tu equipo también lo tiene. Comunica en exceso; nunca en defecto.',
      },
    ],
    quiz: [
      { pregunta: '¿Cuál es la diferencia entre liderar y gestionar?', opciones: ['Ninguna, es lo mismo', 'Liderar es hacer las cosas correctas; gestionar, hacerlas bien', 'Gestionar es más importante'], correcta: 1 },
      { pregunta: '¿Cuál es el error más común en comunicación de equipo?', opciones: ['Comunicar demasiado', 'Asumir que el otro lo entendió', 'Usar herramientas digitales'], correcta: 1 },
    ],
  },
  {
    id: 'productividad',
    icon: '⚡',
    color: '#14B8A6',
    titulo: 'Productividad y sistemas',
    desc: 'Trabaja menos horas con mejores resultados.',
    lecciones: [
      {
        id: 'productividad-1',
        titulo: 'La regla del 80/20 aplicada al negocio',
        contenido: 'El Principio de Pareto dice que el 20% de tus actividades genera el 80% de tus resultados. En un negocio: el 20% de tus clientes genera el 80% de tus ingresos; el 20% de tus productos o servicios representa el 80% de tu beneficio. La productividad real no es hacer más cosas: es identificar ese 20% y dedicarle el máximo de tu energía, eliminando o delegando el resto.',
      },
      {
        id: 'productividad-2',
        titulo: 'Sistemas y automatización básica',
        contenido: 'Un sistema es un proceso documentado que produce resultados consistentes sin depender de tu presencia. Para crear sistemas: primero haz la tarea tú mismo y documenta cada paso; luego simplifica eliminando lo innecesario; después, enseña a otra persona o automatiza con herramientas digitales. Herramientas clave: Notion o Trello para gestión de tareas, Zapier o Make para automatizaciones, y un CRM para gestionar clientes.',
      },
      {
        id: 'productividad-3',
        titulo: 'Gestión del tiempo del emprendedor',
        contenido: 'El tiempo es el único recurso no renovable. Técnicas que funcionan: Time Blocking (asignar bloques de tiempo a categorías de tareas antes de que lleguen las urgencias), la regla de los 2 minutos (si algo tarda menos de 2 minutos, hazlo ahora), y las "3 victorias del día" (cada mañana define las 3 cosas que, si las completas, el día habrá sido exitoso independientemente de lo demás).',
      },
    ],
    quiz: [
      { pregunta: '¿Qué dice el Principio de Pareto?', opciones: ['Todo es igualmente importante', 'El 20% de acciones genera el 80% de resultados', 'Hay que hacer más para conseguir más'], correcta: 1 },
      { pregunta: '¿Qué es un sistema en un negocio?', opciones: ['Un software de gestión', 'Un proceso documentado que funciona sin tu presencia', 'Un equipo de trabajo'], correcta: 1 },
    ],
  },
]

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Formacion({ onNavigate, currentPage }) {
  const { user, agregarXP } = useAuth()
  const [vista, setVista]             = useState('lista')        // 'lista' | 'vertical' | 'leccion'
  const [verticalActual, setVertical] = useState(null)
  const [leccionActual, setLeccion]   = useState(null)
  const [completadas, setCompletadas] = useState(new Set())
  const [respuestasQuiz, setRespuestasQuiz] = useState({})       // { preguntaIdx: opcionIdx }
  const [feedback, setFeedback]       = useState(null)           // null | { idx, correcto }

  useEffect(() => {
    if (user) cargarProgreso()
  }, [user])

  // ─── Cargar progreso desde Supabase ───────────────────────────
  const cargarProgreso = async () => {
    const { data } = await supabase
      .from('formacion_progreso')
      .select('leccion_id')
      .eq('user_id', user.id)
    if (data) setCompletadas(new Set(data.map(r => r.leccion_id)))
  }

  // ─── Marcar lección como completada ───────────────────────────
  const marcarCompletada = async (leccionId) => {
    if (completadas.has(leccionId)) return
    const nuevas = new Set(completadas)
    nuevas.add(leccionId)
    setCompletadas(nuevas)
    await supabase.from('formacion_progreso').upsert({
      user_id:    user.id,
      leccion_id: leccionId,
      completada: true,
    }, { onConflict: 'user_id,leccion_id' })
    await agregarXP(10)
  }

  // ─── Porcentaje de progreso por vertical ──────────────────────
  const porcentaje = (v) => {
    const total = v.lecciones.length
    const hechas = v.lecciones.filter(l => completadas.has(l.id)).length
    return total === 0 ? 0 : Math.round((hechas / total) * 100)
  }

  // ─── Responder quiz ───────────────────────────────────────────
  const responderQuiz = (pregIdx, opcionIdx) => {
    if (respuestasQuiz[pregIdx] !== undefined) return   // ya respondida
    setRespuestasQuiz(prev => ({ ...prev, [pregIdx]: opcionIdx }))
    const correcta = verticalActual.quiz[pregIdx].correcta === opcionIdx
    setFeedback({ idx: pregIdx, correcto: correcta })
    setTimeout(() => setFeedback(null), 2500)
  }

  const abrirVertical = (v) => {
    setVertical(v)
    setRespuestasQuiz({})
    setFeedback(null)
    setVista('vertical')
  }

  const abrirLeccion = (l) => {
    setLeccion(l)
    setVista('leccion')
  }

  // ─── Vista: lista de verticales ───────────────────────────────
  if (vista === 'lista') {
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
          Formación
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
          {VERTICALES.length} verticales de formación para emprendedores
        </p>

        <div className="rg-3" style={{ gap: 18 }}>
          {VERTICALES.map(v => {
            const pct = porcentaje(v)
            return (
              <button
                key={v.id}
                onClick={() => abrirVertical(v)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: 24,
                  textAlign: 'left', cursor: 'pointer',
                  transition: 'border-color var(--transition), transform var(--transition)',
                  display: 'flex', flexDirection: 'column', gap: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = v.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Icono */}
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{v.icon}</div>

                {/* Título */}
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 8 }}>
                  {v.titulo}
                </div>

                {/* Descripción */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 18, flex: 1 }}>
                  {v.desc}
                </p>

                {/* Footer */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {v.lecciones.length} lecciones
                    </span>
                    <span style={{ fontSize: '0.72rem', color: pct === 100 ? '#22C55E' : 'var(--text-muted)', fontWeight: 600 }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22C55E' : v.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Layout>
    )
  }

  // ─── Vista: detalle de vertical ───────────────────────────────
  if (vista === 'vertical' && verticalActual) {
    const v   = verticalActual
    const pct = porcentaje(v)
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        {/* Volver */}
        <button
          onClick={() => setVista('lista')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver a verticales
        </button>

        {/* Header */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: '2.2rem' }}>{v.icon}</span>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.25rem', marginBottom: 4 }}>{v.titulo}</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{v.desc}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progreso</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: pct === 100 ? '#22C55E' : 'var(--text-muted)' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22C55E' : v.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Lista de lecciones */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 20 }}>
          {v.lecciones.map((l, i) => {
            const hecha = completadas.has(l.id)
            return (
              <button
                key={l.id}
                onClick={() => abrirLeccion(l)}
                style={{
                  width: '100%', padding: '16px 20px',
                  background: 'none', border: 'none', borderBottom: i < v.lecciones.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: hecha ? '#22C55E22' : 'var(--surface2)',
                  border: `2px solid ${hecha ? '#22C55E' : 'var(--border2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700,
                  color: hecha ? '#22C55E' : 'var(--text-muted)',
                }}>
                  {hecha ? '✓' : i + 1}
                </span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text)', flex: 1, textAlign: 'left' }}>{l.titulo}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>›</span>
              </button>
            )
          })}
        </div>

        {/* Quiz */}
        {v.quiz?.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: '1rem' }}>🧠</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>Quiz rápido</span>
            </div>
            {v.quiz.map((q, qi) => {
              const respondida = respuestasQuiz[qi] !== undefined
              return (
                <div key={qi} style={{ marginBottom: qi < v.quiz.length - 1 ? 24 : 0 }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500, marginBottom: 10 }}>{q.pregunta}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.opciones.map((op, oi) => {
                      const seleccionada = respuestasQuiz[qi] === oi
                      const esCorrecta   = q.correcta === oi
                      let bg = 'var(--surface2)'
                      let border = '1px solid var(--border)'
                      let color = 'var(--text)'
                      if (respondida && seleccionada && esCorrecta)  { bg = 'rgba(34,197,94,0.12)'; border = '1px solid #22C55E'; color = '#22C55E' }
                      if (respondida && seleccionada && !esCorrecta) { bg = 'rgba(239,68,68,0.12)';  border = '1px solid #EF4444'; color = '#EF4444' }
                      return (
                        <button
                          key={oi}
                          onClick={() => responderQuiz(qi, oi)}
                          disabled={respondida}
                          style={{ padding: '11px 16px', borderRadius: 'var(--radius-sm)', background: bg, border, color, fontSize: '0.85rem', textAlign: 'left', cursor: respondida ? 'default' : 'pointer', transition: 'all 0.2s' }}
                        >
                          {op}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Feedback flotante */}
        {feedback && (
          <div style={{
            position: 'fixed', bottom: 28, right: 28,
            background: feedback.correcto ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${feedback.correcto ? '#22C55E' : '#EF4444'}`,
            borderRadius: 'var(--radius)', padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: '0.88rem', fontWeight: 600,
            color: feedback.correcto ? '#22C55E' : '#EF4444',
            zIndex: 100, backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {feedback.correcto ? '✅ Correcto' : '❌ Incorrecto'}
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        `}</style>
      </Layout>
    )
  }

  // ─── Vista: leccion ───────────────────────────────────────────
  if (vista === 'leccion' && leccionActual) {
    const l     = leccionActual
    const hecha = completadas.has(l.id)
    return (
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        {/* Volver */}
        <button
          onClick={() => setVista('vertical')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver a {verticalActual?.titulo}
        </button>

        {/* Contenido */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, maxWidth: 700 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.15rem', lineHeight: 1.4 }}>{l.titulo}</h2>
            <button
              onClick={() => marcarCompletada(l.id)}
              disabled={hecha}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-sm)', flexShrink: 0,
                background: hecha ? 'rgba(34,197,94,0.12)' : 'var(--surface2)',
                border: `1px solid ${hecha ? '#22C55E' : 'var(--border2)'}`,
                color: hecha ? '#22C55E' : 'var(--text)',
                cursor: hecha ? 'default' : 'pointer', fontSize: '0.82rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {hecha ? '✓ Completada' : '○ Marcar completada'}
            </button>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-soft)', lineHeight: 1.85 }}>
            {l.contenido}
          </p>
        </div>
      </Layout>
    )
  }

  return null
}
