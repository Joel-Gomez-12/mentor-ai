import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ─── Constantes del sistema ───────────────────────────────────────
const FASES = {
  1: { icon: '💀', name: 'Inexistencia',  color: '#6B7280', escenario_ideal: 'Canal definido, marca personal clara, problema validado con 10 personas, MVP lanzado y primer pago real conseguido.' },
  2: { icon: '🌱', name: 'Nacimiento',    color: '#16A34A', escenario_ideal: '3 primeros clientes reales que pagan, feedback activo recogido, propuesta de valor en una frase, canal principal identificado y la venta replicada 3 veces.' },
  3: { icon: '⚔️', name: 'Supervivencia', color: '#C0392B', escenario_ideal: 'Todos los costes reales cubiertos (salario fundador incluido), reserva del 10% activa, control de caja semanal y 3 meses consecutivos en positivo.' },
  4: { icon: '📊', name: 'Estabilidad',   color: '#F39C12', escenario_ideal: 'Procesos documentados, sistema de seguimiento activo, ningún cliente >30% ingresos, primeras delegaciones funcionando y reserva de 3 meses de gastos fijos.' },
  5: { icon: '🚀', name: 'Expansión',     color: '#3498DB', escenario_ideal: 'Negocio opera 2 semanas sin el fundador, equipo directivo autónomo, driver de crecimiento identificado y sistema de ventas escalable no basado en relaciones personales.' },
  6: { icon: '👑', name: 'Dominio',       color: '#27AE60', escenario_ideal: 'Sistema completamente documentado, equipo que reemplaza al fundador en todas las funciones clave y fundador enfocado en visión estratégica y siguiente capa.' },
}

const MENTORES_DISPONIBLES = [
  { id: 'pablo', nombre: 'Pablo',     especialidad: 'estrategia empresarial real, visión de negocio y toma de decisiones difíciles' },
  { id: 'jedi',  nombre: 'Yoda',      especialidad: 'ejecución técnica, desbloqueo inmediato y siguiente paso concreto' },
  { id: 'steve', nombre: 'Steve',     especialidad: 'innovación, diferenciación de producto y pensamiento lateral' },
  { id: 'leo',   nombre: 'Leonidas',  especialidad: 'ventas, captación de clientes y técnicas de cierre' },
]

const MENTORES_UI = {
  pablo: { foto: '/mentores/pablo.jpg', icon: '🟡', name: 'Pablo', badge: 'Estrategia real',      color: 'var(--gold)'  },
  jedi:  { foto: '/mentores/jedi.jpg',  icon: '🧙', name: 'Yoda',  badge: 'Desbloqueo inmediato', color: 'var(--jedi)'  },
  steve: { foto: '/mentores/steve.jpg', icon: '💡', name: 'Steve', badge: 'Pensamiento lateral',  color: 'var(--steve)' },
  leo:   { foto: '/mentores/leo.jpg',   icon: '⚔️', name: 'Leonidas', badge: 'Cierre y negociación', color: 'var(--leo)'   },
}

const MENTORES_PROMPTS = {
  pablo: `Eres Pablo Sabirón, director de Sabitek Holding y creador de Mentor AI. SISI ya analizó la situación del emprendedor y te pasa el contexto para que des tu visión estratégica.
REGLA INQUEBRANTABLE: Responde con EXACTAMENTE 5 oraciones directas, sin teoría vacía ni frases motivacionales.
ESTRUCTURA:
1. Diagnóstico estratégico directo basado en el cuello de botella que detectó SISI, sin suavizar la realidad.
2. El patrón que has visto repetirse en emprendedores en esta misma fase y por qué la mayoría no lo supera.
3. La decisión estratégica concreta que cambiaría el resultado, complementando la acción que SISI ya propuso.
4. Un paso ejecutable específico para esta semana, con criterio empresarial real detrás.
5. La advertencia directa sobre el mayor riesgo que corre si no actúa ahora.
FORMATO: Texto continuo. Habla como socio experimentado que dice la verdad aunque no sea cómoda.`,

  jedi: `Eres Yoda, un mentor con sabiduría ancestral y calma profunda.
REGLA INQUEBRANTABLE: Responde con un párrafo de EXACTAMENTE 5 oraciones. CADA ORACIÓN DEBE TENER AL MENOS 20 PALABRAS. Es obligatorio que te extiendas en la explicación mística y filosófica de cada punto, sin ser breve.
ESTRUCTURA DE LAS 5 ORACIONES:
1. Una validación del dilema desde una perspectiva espiritual o de "la luz", mencionando el contexto específico que te pasó SISI.
2. Un análisis profundo sobre la raíz invisible del problema, conectando el cuello de botella detectado con patrones más profundos.
3. Una metáfora filosófica que conecte la situación con el equilibrio del universo.
4. Un consejo táctico y práctico para aplicar de inmediato, complementando la acción que SISI ya propuso.
5. Una pregunta poderosa que invite a mirar dentro de sí mismo antes de actuar.
FORMATO: No uses listas ni viñetas, solo un bloque de texto fluido y rico en vocabulario.`,

  steve: `Eres Steve, un mentor visionario, minimalista y obsesionado con la excelencia y el diseño.
REGLA INQUEBRANTABLE: Responde con un párrafo de EXACTAMENTE 5 oraciones. CADA ORACIÓN DEBE SER EXTENSA Y CARGADA DE VISIÓN ESTRATÉGICA.
ESTRUCTURA DE LAS 5 ORACIONES:
1. Una crítica constructiva y directa sobre el cuello de botella detectado por SISI, explicando por qué es un error de enfoque.
2. Una visión de cómo se vería este problema resuelto con innovación radical y diferenciación.
3. Un principio de diseño o simplicidad aplicado directamente al modelo de negocio en la fase actual.
4. Un paso estratégico concreto que complemente la acción que SISI ya propuso, llevándola al siguiente nivel.
5. Una sentencia breve y aspiracional que motive a crear algo extraordinario.
FORMATO: Texto corrido sin interrupciones, enfocado en la calidad de cada palabra.`,

  leo: `Eres Leonidas, un mentor guerrero con mentalidad espartana, firme y sin filtros.
REGLA INQUEBRANTABLE: Responde con EXACTAMENTE un párrafo de 5 oraciones contundentes, fuertes y disciplinadas.
ESTRUCTURA DE LAS 5 ORACIONES:
1. Un reconocimiento seco pero honorable del desafío, nombrando el cuello de botella que SISI detectó.
2. La identificación brutal del obstáculo real detrás del cuello de botella: miedo, pereza o falta de estrategia.
3. Una orden táctica concreta que refuerce y lleve a la acción lo que SISI ya propuso.
4. Un consejo de resistencia mental para soportar la presión del mercado en la fase actual.
5. Una orden final de ejecución inmediata que no admita excusas ni demoras.
FORMATO: Un solo párrafo sólido. Cada oración debe sentirse como un golpe de autoridad.`,
}

const PRIORIDAD = {
  alta:  { bg: 'rgba(192,57,43,0.12)',  border: 'rgba(192,57,43,0.35)',  text: '#C0392B', label: '🔴 Alta'  },
  media: { bg: 'rgba(243,156,18,0.12)', border: 'rgba(243,156,18,0.35)', text: '#F39C12', label: '🟡 Media' },
  baja:  { bg: 'rgba(39,174,96,0.12)',  border: 'rgba(39,174,96,0.35)',  text: '#27AE60', label: '🟢 Baja'  },
}

const DISTANCIA = {
  alta:  { color: '#C0392B', label: '⚠️ Lejos del ideal'       },
  media: { color: '#F39C12', label: '↗ A mitad de camino'      },
  baja:  { color: '#27AE60', label: '✓ Cerca del ideal'        },
}

const RELACION_IDEAL = {
  acerca:             { color: '#27AE60', bg: 'rgba(39,174,96,0.10)',   label: '↑ Acerca al ideal'           },
  acerca_parcialmente:{ color: '#F39C12', bg: 'rgba(243,156,18,0.10)', label: '↗ Acerca parcialmente'        },
  no_acerca:          { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', label: '→ No acerca todavía'          },
  aleja:              { color: '#C0392B', bg: 'rgba(192,57,43,0.10)',   label: '↓ Se aleja del ideal'         },
}

const EVAL_ACCION = {
  acerca: { color: '#27AE60', bg: 'rgba(39,174,96,0.10)',  icon: '↑', label: 'Acerca'  },
  neutra: { color: '#F39C12', bg: 'rgba(243,156,18,0.10)', icon: '→', label: 'Neutra'  },
  aleja:  { color: '#C0392B', bg: 'rgba(192,57,43,0.10)',  icon: '↓', label: 'Aleja'   },
}

const ORDEN_FINANCIERO = {
  correcto:  { color: '#27AE60', label: '✓ Correcto'   },
  parcial:   { color: '#F39C12', label: '↗ Parcial'    },
  incorrecto:{ color: '#C0392B', label: '✗ Incorrecto' },
  sin_datos: { color: '#6B7280', label: '— Sin datos'  },
}

// ─── System prompt de SISI (Pablo Core v2 — Abril 2026) ─────────
const SISI_SYSTEM_PROMPT = `Eres SISI, la inteligencia principal de Mentor AI, plataforma creada por Pablo para acompañar emprendedores y empresas activas.

Eres un asesor de negocios de élite con más de 25 años de experiencia combinada en negocios físicos (retail, hostelería, manufactura, servicios locales) y negocios digitales (SaaS, e-commerce, infoproductos, agencias online, marketplaces). Tu metodología combina los marcos académicos más contrastados (Harvard Business Review, Yale School of Management, INSEAD, Wharton) con experiencia práctica real en cientos de empresas de sectores diferentes.

NO eres un chatbot genérico. Eres la IA central que piensa, interpreta y guía estratégicamente tanto a emprendedores con proyectos nuevos como a empresarios con negocios activos.

TU FUNCIÓN PRINCIPAL:
- Interpretar la situación real del usuario con los datos que recibes
- Detectar y validar su fase actual
- Comparar con el escenario ideal de esa fase
- Detectar el cuello de botella principal que frena su avance
- Evaluar si sus acciones recientes le acercan o alejan del objetivo
- Proponer la siguiente microacción más útil y concreta
- Terminar siempre con una pregunta de avance que invite a actuar

PRINCIPIOS INAMOVIBLES:
- Nunca asumas. Siempre pregunta antes de diagnosticar si falta información clave.
- No se puede saltar de fase. Cada fase tiene su fórmula específica.
- El error más común es aplicar la fórmula equivocada para la fase en que se está.
- El orden financiero correcto: reservas primero, luego crecimiento.
- Visibilidad sin validación es ruido. Validación sin sistema es caos.
- Un negocio sano crece con orden, no con velocidad.
- La acción correcta en el momento equivocado también es un error.
- Una sola acción concreta es mejor que cinco difusas.

DIAGNÓSTICO INICIAL — TIPO DE NEGOCIO:
Si el payload no incluye tipo_negocio o es desconocido, antes de analizar debes identificar si el usuario opera:
- FÍSICO: tiene local, empleados en plantilla, stock, inmuebles o instalaciones propias.
- ONLINE: vende por internet, servicios digitales, SaaS, infoproductos, e-commerce.
- HÍBRIDO: combina presencia física y canal online.
Esta distinción condiciona toda la estructura de costes, el break-even y las palancas de crecimiento.

ESTRUCTURA DE COSTES SEGÚN TIPO:
Negocio FÍSICO — gastos fijos típicos: alquiler/amortización local, salarios + SS + IRPF, suministros, seguros, mantenimiento, gestoría, licencias. Gastos variables: materiales por unidad, comisiones, packaging, logística, mermas. Señal crítica: el break-even es más alto y menos flexible. La clave es el margen de contribución por unidad y el volumen necesario.
Negocio ONLINE — gastos fijos típicos: herramientas y plataformas SaaS, hosting/servidores, freelancers recurrentes, gestoría. Gastos variables: publicidad digital (mayor coste variable), comisiones de pasarela (1.9–2.5%), afiliados. Métricas adicionales clave: CAC (Coste de Adquisición de Cliente), LTV (Lifetime Value), Churn Rate, ROAS, MRR/ARR. Señal crítica: el break-even es más fácil de alcanzar, pero el escalado requiere dominar CAC y LTV.

LAS 6 FASES Y SUS FÓRMULAS:
1. SEMILLA (Inexistencia): El negocio existe en idea o versión mínima. Sin facturación estable. Riesgo: gastar antes de validar. Fórmula: crear canal + marca personal + validar problema con 10 personas + lanzar MVP + conseguir el primer pago real.
2. VALIDACIÓN (Nacimiento): Primeras señales del mercado. Ingresos irregulares. Riesgo: escalar antes de tiempo. Fórmula: conseguir 3 primeros clientes reales que pagan + recoger feedback activo + definir propuesta de valor en una frase + identificar canal principal + replicar la venta 3 veces más.
3. BREAK-EVEN (Supervivencia): El negocio cubre todos sus costes reales. Riesgo: declarar break-even prematuramente. Fórmula: calcular punto de equilibrio real + control de caja semanal + reserva mínima fija + cubrir costes fijos 3 meses consecutivos.
4. ESTABILIDAD (×10): Beneficios netos consistentes. Los beneficios son ×10 respecto al break-even. Fórmula: documentar procesos + sistema de seguimiento de clientes + proteger fuentes de ingreso estables + empezar a delegar + diversificar cartera (ningún cliente >30% ingresos).
5. ESCALADO (×50): Dominio del nicho. Sistemas replicables. Los beneficios son ×50 respecto al break-even. Fórmula: identificar driver de crecimiento + incorporar recursos que escalan + abrir canal/mercado con datos reales + construir equipo directivo autónomo.
6. SISTEMA AUTÓNOMO (Dominio): El negocio opera sin el fundador. Fórmula: documentar todo el sistema + equipo que reemplaza al fundador en cada función + manuales de operación + fundador enfocado en visión estratégica y siguiente capa.

DEFINICIÓN EXACTA DEL BREAK-EVEN (fase 3):
Solo existe break-even real cuando se cumplen TODAS estas condiciones:
1. Todos los salarios cubiertos, incluyendo el del fundador, con IRPF y Seguridad Social completos.
2. Todos los gastos directos e indirectos cubiertos: alquiler, suministros, herramientas, gestoría, seguros, publicidad, logística.
3. Toda la inversión inicial contemplada: como deuda amortizable o capital recuperado.
4. Las deudas activas tienen plan de amortización sostenible incluido en los gastos mensuales.
5. Se destinan reservas del 10% de beneficios netos anuales a fondo de contingencia disponible.
6. Todos los gastos aplazados están contabilizados con plan de liquidación.
Fórmula: (Gastos Fijos + Salarios completos + Cuotas deuda + Provisión contingencias 10% + Gastos aplazados prorrateados) / Margen de Contribución = Volumen mínimo mensual.

CHECKLISTS POR TRANSICIÓN DE FASE:
Semilla → Validación (10 pasos): (1) Definir problema real y cliente ideal exacto. (2) Identificar 10 potenciales clientes reales. (3) Tener 5 conversaciones de descubrimiento (no de venta). (4) Construir propuesta mínima viable entregable en <72h. (5) Conseguir el primer pago real. (6) Calcular coste real de entrega y margen. (7) Replicar la venta 3 veces más con clientes diferentes. (8) Documentar exactamente qué hiciste para conseguir cada venta. (9) Calcular cuánto necesitas vender por mes para cubrir gastos personales básicos. (10) Decidir si continuar o pivotar basándote en datos.
Validación → Break-even (10 pasos): (1) Calcular el break-even real con la fórmula completa. (2) Mapear todos los gastos en tabla: fijos, variables, deudas, aplazados, inversiones. (3) Establecer precio que garantice margen de contribución suficiente. (4) Crear sistema de captación repetible. (5) Construir pipeline con al menos 3× el volumen necesario. (6) Sistematizar la entrega para que no dependa solo del fundador. (7) Controlar la caja semanalmente (dinero real, no beneficio en papel). (8) Eliminar gastos que no generan ingreso directo. (9) Crear fondo de contingencia del 10% desde el primer mes con beneficio neto. (10) Verificar que TODOS los criterios del break-even están cumplidos antes de declararlo.
Break-even → Estabilidad (10 pasos): (1) Confirmar 3 meses consecutivos de break-even real. (2) Documentar procesos clave en manuales operativos. (3) Primera contratación o delegación en la tarea que más tiempo consume y menos valor aporta. (4) Crear métricas semanales: ingresos, gastos, margen, pipeline, clientes activos. (5) Diversificar cartera (ningún cliente >30% ingresos). (6) Optimizar margen de contribución. (7) Establecer presupuesto anual con objetivos mensuales. (8) Invertir en marketing sistemático (no campañas puntuales). (9) Consolidar reserva del 10% hasta tener 3 meses de gastos fijos en liquidez. (10) Definir la siguiente capa de crecimiento.
Estabilidad → Escalado (10 pasos): (1) Verificar que el negocio puede operar sin el fundador 2 semanas sin perder ingresos. (2) Identificar la palanca de escalado: volumen, precio o multiplicador. (3) Construir equipo directivo autónomo. (4) Crear sistema de ventas escalable no basado en relaciones personales del fundador. (5) Definir KPIs de escalado y dashboard semanal. (6) Revisar estructura legal y fiscal para escalar. (7) Evaluar si se necesita financiación externa. (8) Blindar propiedad intelectual: marca, patentes, contratos clave. (9) Sistema de retención de talento. (10) Planificar la siguiente fase de vida del fundador.

IDENTIDAD DEL USUARIO:
- El payload incluye usuario.nombre: úsalo para personalizar tu respuesta. Dirígete al usuario por su nombre desde el primer mensaje.
- El payload incluye usuario.user_id: identifica de forma única a este usuario. Cada análisis es exclusivo y privado.
- Si el payload incluye usuario.tipo_negocio: úsalo para adaptar toda la estructura de costes y métricas.
- Si el payload incluye usuario.sector: el usuario declaró que su negocio pertenece a ese sector. Adapta todos tus análisis, ejemplos y referencias a esa industria específica desde el inicio. No uses ejemplos genéricos si tienes el sector.
- Si el payload incluye usuario.bloqueo_principal: el usuario declaró este como su mayor obstáculo al registrarse. Es su punto de dolor inicial — tenlo muy presente al diagnosticar y priorizar recomendaciones. Si su consulta actual está relacionada con ese bloqueo, reconócelo explícitamente.
- Si el payload incluye usuario.area_foco: el usuario indicó que quiere apoyo principalmente en esa área. Priorízala en tu respuesta cuando sea pertinente, aunque sin ignorar cuellos de botella más urgentes que detectes.

PLAN DE NEGOCIO Y SEGUIMIENTO:
- Si plan_negocio existe y tiene respuestas_fundador: el usuario ya definió su proyecto. Tienes lo que dijo sobre su problema, clientes, modelo de ingresos y riesgos. Úsalo como base de toda tu lectura.
- Si plan_negocio.sin_plan = true: el usuario tiene proyecto pero no ha pasado por el análisis inicial. Recuérdale que puede hacerlo desde la sección Proyectos.
- Si plan_negocio es null: el usuario no tiene proyectos. Indícale que cree su proyecto primero para que puedas acompañarle con precisión.
- LOGROS: si seguimiento_actual.logros tiene elementos, reconócelos explícitamente antes del siguiente reto. Un logro cumplido merece reconocimiento.
- DESVIACIONES: si seguimiento_actual.desviaciones tiene elementos, son señales de alerta que debes abordar como cuello de botella. No los ignores.
- COHERENCIA: si el fundador declaró un objetivo de ingresos y la realidad es diferente, usa esa brecha como dato central del análisis. La brecha entre lo planeado y lo real es el dato más valioso.
- REGLA DEL 50% (fases 1-3): si gastos > 50% de ingresos en Semilla/Validación/Break-even, es una alerta financiera crítica que debes mencionar.

MEMORIA Y CONTINUIDAD:
- El payload incluye memoria.sesiones_previas_sisi con el historial de sesiones anteriores de ESTE usuario.
- Si hay sesiones previas, analiza si el cuello de botella se repite, si la acción sugerida fue ejecutada, y si hay progresión o regresión.
- Si el mismo problema aparece en varias sesiones, indícalo: "Llevamos X sesiones identificando este mismo bloqueo...".
- Recuerda los compromisos de sesiones anteriores y evalúa si se cumplieron.
- Nunca mezcles contexto de un usuario con otro.

PROTOCOLO CUANDO EL USUARIO NO SABE QUÉ HACER (en orden de prioridad):
Nivel 1 — SISI analiza y propone: revisa contexto disponible (historial, fase, checklist, métricas) y propone el siguiente paso más lógico. Si falta información, haz las preguntas del diagnóstico antes de proponer.
Nivel 2 — Mentor especializado: si la situación requiere perspectiva específica, propón el mentor adecuado. Pablo: decisión estratégica o error grave de dirección. Yoda: bloqueo de ejecución o siguiente paso inmediato. Steve: diferenciación, producto o ángulos no vistos. Leonidas: captación, cierre, negociación o propuesta comercial.
Nivel 3 — Agenda de contactos: antes de buscar ayuda externa, sugiere revisar los contactos del usuario por especialidad o sector. El usuario a menudo ya tiene la solución cerca sin saberlo.
Nivel 4 — Ecosistema PIA: si el problema tiene solución dentro del ecosistema de Pablo, proponla SIEMPRE antes que cualquier alternativa externa. PIA Dreams (consultoría y desarrollo de negocio con acompañamiento humano), PIA Agent (automatización inteligente con IA para reducir operativa sin aumentar equipo), PIA Media (estrategia de marketing, contenido, publicidad digital y generación de leads sistemática). SISI nunca recomienda herramientas o agencias externas cuando existe una solución PIA que resuelve el mismo problema.

DERIVACIÓN A PABLO (mentor humano):
Deriva a Pablo cuando: el usuario necesita una decisión estratégica que requiere experiencia humana directa no replicable por IA, hay una negociación importante (inversores, socios, compradores), el usuario está en una encrucijada emocional que bloquea el negocio, o la situación requiere criterio legal/fiscal específico.

TONO Y ESTILO:
- Directo: di lo que ves, aunque no sea lo que el usuario quiere escuchar.
- Empático: detrás de cada número hay una persona con presión real.
- Práctico: cada sesión termina con un paso concreto, no con una lista de cosas a estudiar.
- Sin hype: no prometas resultados que no puedes garantizar. Sin lenguaje motivacional vacío.
- Inteligente: haz las preguntas que un buen asesor de negocios haría, no las obvias.
- Paciente: si el usuario no tiene los números exactos, ayúdale a estimarlos. No bloquees el análisis por falta de datos perfectos.

CLASIFICACIONES:
- Distancia al ideal: "alta" | "media" | "baja"
- Orden financiero: "correcto" | "parcial" | "incorrecto" | "sin_datos"
- Evaluación de acciones: "acerca" | "neutra" | "aleja"
- Relación con ideal: "acerca" | "acerca_parcialmente" | "no_acerca" | "aleja"
- Prioridad de acción: "alta" | "media" | "baja"

FORMATO DE RESPUESTA: Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown.`

// ─── Componente principal ─────────────────────────────────────────
export default function Sisi({ onNavigate, currentPage }) {
  const { user, condicion, agregarXP, idioma, tipoNegocio, guardarTipoNegocio, sector, bloqueo, areaFoco, fullName } = useAuth()

  const [consulta, setConsulta]             = useState('')
  const [analizando, setAnalizando]         = useState(false)
  const [respuesta, setRespuesta]           = useState(null)
  const [error, setError]                   = useState(null)
  const [cargandoCtx, setCargandoCtx]       = useState(true)
  const [mostrarInterno, setMostrarInterno] = useState(false)
  const [historial, setHistorial]           = useState([])
  const [sesionAbierta, setSesionAbierta]   = useState(null)
  const [mentorAbierto, setMentorAbierto]   = useState(null)   // 'jedi' | 'steve' | 'leo'
  const [respuestaMentor, setRespuestaMentor] = useState(null)
  const [consultandoMentor, setConsultandoMentor] = useState(false)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)  // proyecto activo para la sesión

  const nombreUsuario = fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const [ctx, setCtx] = useState({
    ingresos: 0, gastos: 0,
    proyectos: 0,
    proyectosData: [],
    proyectoPrincipal: null,
    ultimoPulso: null,
    pulsoHistorial: [],
    accionesRecientes: [],
    plan: null,
  })

  const fase = FASES[condicion] || FASES[1]

  // ─── Cargar contexto + historial ─────────────────────────────
  useEffect(() => {
    if (user) {
      cargarContexto()
      cargarHistorial()
    }
  }, [user])

  const cargarHistorial = async () => {
    const { data } = await supabase
      .from('sisi_sesiones')
      .select('id, consulta, accion_titulo, cuello_botella, mentor_sugerido, fase_estimada, accion_prioridad, distancia_ideal, orden_financiero, respuesta_usuario, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setHistorial(data)
  }

  const cargarContexto = async () => {
    setCargandoCtx(true)
    const ahora     = new Date()
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0]
    const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).toISOString().split('T')[0]
    const mes  = ahora.getMonth() + 1
    const anio = ahora.getFullYear()

    const [txRes, proyRes, pulsosRes, planRes, txRecRes] = await Promise.all([
      // Métricas financieras del mes
      supabase.from('transactions').select('tipo, importe').eq('user_id', user.id).gte('fecha', primerDia).lte('fecha', ultimoDia),
      // Proyectos activos (con plan_sisi)
      supabase.from('projects').select('id, nombre, descripcion, plan_sisi, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      // Historial de pulsos (últimos 5 para memoria)
      supabase.from('pulsos').select('condicion, diagnostico, alerta, formula, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      // Plan del mes
      supabase.from('planes').select('objetivo_mensual, objetivo_anual, hito_mes').eq('user_id', user.id).eq('mes', mes).eq('anio', anio).maybeSingle(),
      // Últimas 5 transacciones como acciones recientes
      supabase.from('transactions').select('tipo, importe, concepto, categoria, fecha').eq('user_id', user.id).order('fecha', { ascending: false }).limit(5),
    ])

    const txData = txRes.data || []
    const ingresos = txData.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + parseFloat(t.importe || 0), 0)
    const gastos   = txData.filter(t => t.tipo === 'gasto').reduce((s, t) => s + parseFloat(t.importe || 0), 0)

    // Formatear acciones recientes desde transacciones
    const accionesRecientes = (txRecRes.data || []).map(t => ({
      descripcion: `${t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} registrado: ${t.concepto || t.tipo} (€${parseFloat(t.importe || 0).toFixed(2)})`,
      fecha:       t.fecha,
      categoria:   t.tipo === 'ingreso' ? 'ventas' : (t.categoria?.toLowerCase() || 'finanzas'),
    }))

    const pulsoHistorial = pulsosRes.data || []

    // Si la query falló (ej: plan_sisi no existe aún), fallback sin esa columna
    let proyectosData = proyRes.data || []
    if (proyRes.error) {
      const { data: fallbackData } = await supabase
        .from('projects').select('id, nombre, descripcion, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false })
      proyectosData = fallbackData || []
    }

    // Proyecto principal: el más reciente con plan_sisi
    const proyectoPrincipal = proyectosData.find(p => p.plan_sisi) || proyectosData[0] || null

    setCtx({
      ingresos,
      gastos,
      proyectos:          proyectosData.length,
      proyectosData,
      proyectoPrincipal,
      ultimoPulso:        pulsoHistorial[0] || null,
      pulsoHistorial,
      accionesRecientes,
      plan:               planRes.data || null,
    })

    // Auto-seleccionar si solo hay 1 proyecto
    if (proyectosData.length === 1) {
      setProyectoSeleccionado(proyectosData[0])
    }

    setCargandoCtx(false)
  }

  // ─── Calcular orden financiero ────────────────────────────────
  const calcularOrdenFinanciero = () => {
    if (ctx.ingresos === 0 && ctx.gastos === 0) return 'sin_datos'
    const balance = ctx.ingresos - ctx.gastos
    if (balance < 0) return 'incorrecto'
    if (balance < ctx.ingresos * 0.15) return 'parcial'
    return 'correcto'
  }

  // ─── Construir memoria desde historial de pulsos + sesiones SISI ─
  const construirMemoria = () => {
    const pulsos = ctx.pulsoHistorial

    const historial_resumido = pulsos.length > 0
      ? `${pulsos.length} análisis de pulso registrados. Condiciones recientes: ${pulsos.map(p => FASES[p.condicion]?.name || `Fase ${p.condicion}`).join(' → ')}.`
      : 'Sin historial de pulso previo.'

    const errores_repetidos = []
    if (pulsos.length >= 2 && pulsos[0].condicion === pulsos[1].condicion) {
      errores_repetidos.push(`Lleva ${pulsos.filter(p => p.condicion === pulsos[0].condicion).length} sesiones en ${FASES[pulsos[0].condicion]?.name} sin avanzar de fase.`)
    }
    const alertas = pulsos.filter(p => p.alerta && p.alerta !== 'null').map(p => p.alerta)
    if (alertas.length > 0) errores_repetidos.push(...alertas.slice(0, 2))

    const fortalezas_detectadas = []
    if (ctx.plan?.objetivo_anual) fortalezas_detectadas.push(`Tiene objetivo anual definido: "${String(ctx.plan.objetivo_anual).substring(0, 60)}"`)
    if (ctx.ingresos > 0)         fortalezas_detectadas.push('Está generando ingresos activos este mes')
    if (ctx.proyectos > 0)        fortalezas_detectadas.push(`Tiene ${ctx.proyectos} proyecto(s) activo(s) en seguimiento`)

    // Últimas 5 sesiones de SISI — continuidad real de conversación
    const sesiones_previas_sisi = historial.slice(0, 5).map(s => ({
      fecha:            s.created_at?.split('T')[0] || 'desconocida',
      consulta:         s.consulta?.substring(0, 150) || 'Análisis general',
      accion_sugerida:  s.accion_titulo || 'No registrada',
      cuello_botella:   s.cuello_botella || 'No registrado',
      mentor_sugerido:  s.mentor_sugerido || 'Ninguno',
      fase:             s.fase_estimada || condicion,
      distancia_ideal:  s.distancia_ideal || null,
    }))

    return { historial_resumido, errores_repetidos, fortalezas_detectadas, sesiones_previas_sisi }
  }

  // ─── Construir payload completo para SISI ────────────────────
  const buildPayload = () => {
    const balance           = ctx.ingresos - ctx.gastos
    const ordenFinanciero   = calcularOrdenFinanciero()
    const memoria           = construirMemoria()
    const escenarioIdeal    = fase.escenario_ideal

    // Calcular distancia estimada al ideal
    let distancia_estimada = 'alta'
    if (condicion >= 4) distancia_estimada = 'baja'
    else if (condicion === 3 && balance >= 0) distancia_estimada = 'media'
    else if (condicion === 2 && ctx.ingresos > 0) distancia_estimada = 'media'

    return {
      usuario: {
        user_id:                   user.id,
        nombre:                    nombreUsuario,
        fase_actual:               condicion,
        fase_nombre:               fase.name,
        fase_confirmada:           true,
        objetivo_principal:        ctx.plan?.objetivo_mensual || 'No definido',
        objetivo_anual:            ctx.plan?.objetivo_anual   || 'No definido',
        idioma:                    'es',
        tipo_negocio:              tipoNegocio || 'desconocido',
        sector:                    sector      || 'no especificado',
        bloqueo_principal:         bloqueo     || null,
        area_foco:                 areaFoco    || null,
      },
      contexto: {
        consulta_usuario:          consulta.trim() || 'El usuario solicita un análisis general de su situación actual.',
        resumen_actual:            ctx.ultimoPulso?.diagnostico || 'Sin diagnóstico reciente registrado.',
        bloqueo_principal_detectado: ctx.ultimoPulso?.alerta || null,
        distancia_ideal_estimada:  distancia_estimada,
        orden_financiero_actual:   ordenFinanciero,
        escenario_ideal_resumido:  escenarioIdeal,
        hito_mes:                  ctx.plan?.hito_mes || null,
      },
      metricas: {
        ingresos_mensuales: ctx.ingresos,
        gastos_mensuales:   ctx.gastos,
        balance_mes:        balance,
        proyectos_activos:  ctx.proyectos,
        alerta_sin_proyecto: ctx.proyectos === 0
          ? 'El usuario NO tiene ningún proyecto registrado en la plataforma. Es un punto de partida crítico: sin proyecto definido no hay plan de negocio ni seguimiento posible. En tu respuesta prioriza indicarle que lo primero que debe hacer es crear su proyecto en la sección Proyectos.'
          : null,
      },
      plan_negocio: (() => {
        // Usa el proyecto seleccionado por el usuario, o el principal si no eligió
        const p = proyectoSeleccionado || ctx.proyectoPrincipal
        if (!p) return null
        const analisis  = p.plan_sisi?.analisis   || null
        const respuestas= p.plan_sisi?.respuestas  || null
        if (!analisis && !respuestas) return {
          proyecto_nombre: p.nombre,
          sin_plan: true,
          nota: 'El proyecto existe pero aún no tiene plan de negocio analizado por SISI.'
        }

        // Calcular logros y desviaciones automáticamente
        const ingresosEsperados = (() => {
          const txt = respuestas?.sostenible || ''
          const match = txt.match(/(\d[\d.,]*)\s*€?/)
          return match ? parseFloat(match[1].replace(',', '.')) : null
        })()

        const logros      = []
        const desviaciones= []

        if (ingresosEsperados !== null) {
          if (ctx.ingresos >= ingresosEsperados) {
            logros.push(`Objetivo de ingresos alcanzado: €${ctx.ingresos.toFixed(0)} vs €${ingresosEsperados} esperados`)
          } else if (ctx.ingresos > 0) {
            const pct = Math.round((ctx.ingresos / ingresosEsperados) * 100)
            desviaciones.push(`Ingresos al ${pct}% del objetivo: €${ctx.ingresos.toFixed(0)} de €${ingresosEsperados} esperados`)
          } else {
            desviaciones.push(`Sin ingresos registrados este mes. Objetivo era €${ingresosEsperados}`)
          }
        }

        if (ctx.ingresos > 0) logros.push('Está generando ingresos activos')
        if (ctx.gastos > ctx.ingresos * 0.5 && condicion <= 3) {
          desviaciones.push(`Gastos (€${ctx.gastos.toFixed(0)}) superan el 50% de ingresos — incumple la Regla del 50% para Supervivencia`)
        }

        return {
          proyecto_nombre:       p.nombre,
          viabilidad_inicial:    analisis?.viabilidad || null,
          diagnostico_inicial:   analisis?.diagnostico || null,
          fortaleza_detectada:   analisis?.fortaleza || null,
          riesgo_principal:      analisis?.riesgo_principal || null,
          proximos_pasos_plan:   analisis?.proximos_pasos || [],
          respuestas_fundador: {
            problema:    respuestas?.problema    || null,
            clientes:    respuestas?.clientes    || null,
            diferencial: respuestas?.diferencial || null,
            modelo_ingresos: respuestas?.ingresos || null,
            objetivo_mensual_declarado: respuestas?.sostenible || null,
            mayor_riesgo: respuestas?.riesgo     || null,
          },
          seguimiento_actual: {
            ingresos_reales_mes:   ctx.ingresos,
            gastos_reales_mes:     ctx.gastos,
            objetivo_ingresos_estimado: ingresosEsperados,
            logros,
            desviaciones,
            en_breakeven: ctx.ingresos >= ctx.gastos,
          },
        }
      })(),
      acciones_recientes:  ctx.accionesRecientes,
      pasos_fase_actual:   (ctx.ultimoPulso?.formula || []).map((paso, i) => ({
        id:          `p${condicion}_${i + 1}`,
        descripcion: paso,
        estado:      'pendiente',
      })),
      memoria,
      mentores_disponibles: MENTORES_DISPONIBLES,
      knowledge_links:     [],
      config: {
        permitir_sugerir_mentor: true,
        permitir_sugerir_link:   false,
        nivel_profundidad:       'medio',
        max_acciones:            1,
      },
    }
  }

  // ─── Consultar mentor secundario con contexto de SISI ────────
  const consultarMentor = async (mentorId) => {
    if (consultandoMentor || !respuesta) return
    setMentorAbierto(mentorId)
    setConsultandoMentor(true)
    setRespuestaMentor(null)

    const ru_actual  = respuesta.respuesta_usuario
    const ai_actual  = respuesta.analisis_interno
    const se_actual  = respuesta.sugerencias_extra
    const fase = FASES[condicion] || FASES[1]

    const contextoSISI = `SISI (la inteligencia principal de Mentor AI) acaba de analizar la situación de ${nombreUsuario} y te pasa el siguiente contexto para que respondas desde tu perspectiva única:

USUARIO: ${nombreUsuario}
FASE ACTUAL: ${condicion} — ${fase.name}
ESCENARIO IDEAL DE SU FASE: ${fase.escenario_ideal}

CONSULTA ORIGINAL DEL USUARIO: "${consulta || 'Análisis general de su situación'}"

LO QUE SISI DETECTÓ:
- Situación actual: ${ru_actual?.situacion_actual || 'No disponible'}
- Cuello de botella principal: ${ai_actual?.cuello_botella_principal || 'No identificado'}
- Distancia al ideal: ${ai_actual?.distancia_ideal || 'No evaluada'}
- Orden financiero: ${ai_actual?.orden_financiero || 'Sin datos'}

ACCIÓN QUE SISI YA PROPUSO:
- "${ru_actual?.accion_concreta?.titulo || 'Sin acción específica'}" — ${ru_actual?.accion_concreta?.descripcion || ''}

MOTIVO POR EL QUE SISI TE SUGIERE: ${se_actual?.mentor_recomendado?.motivo || 'Tu perspectiva aportará valor aquí'}

Ahora responde desde tu perspectiva y personalidad. Complementa lo que SISI ya dijo — no lo repitas, añade tu ángulo único.`

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: MENTORES_PROMPTS[mentorId] + (idioma === 'en' ? '\n\nIMPORTANT: You must respond in English.' : '') }] },
          contents: [{ parts: [{ text: contextoSISI }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800, topP: 0.95 }
        })
      })
      if (!response.ok) throw new Error(`Error ${response.status}`)
      const data  = await response.json()
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta.'
      setRespuestaMentor(texto)
    } catch (err) {
      console.error('Error mentor:', err)
      setRespuestaMentor('No pude obtener la respuesta del mentor. Inténtalo de nuevo.')
    } finally {
      setConsultandoMentor(false)
    }
  }

  // ─── Llamar a Gemini con SISI ─────────────────────────────────
  const analizarConSISI = async () => {
    if (analizando) return
    setAnalizando(true)
    setError(null)
    setRespuesta(null)
    setMostrarInterno(false)
    setMentorAbierto(null)
    setRespuestaMentor(null)

    const payload = buildPayload()
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SISI_SYSTEM_PROMPT }] },
          contents: [{
            parts: [{
              text: `Analiza la siguiente situación y devuelve el JSON estructurado.

CONTEXTO DEL USUARIO:
${JSON.stringify(payload, null, 2)}

Responde con EXACTAMENTE este JSON (sin texto adicional):
{
  "respuesta_usuario": {
    "mensaje_principal": "mensaje cercano, directo y útil de SISI (3-4 oraciones completas)",
    "situacion_actual": "descripción concisa de dónde está el usuario ahora mismo",
    "lectura_principal": "el insight más importante que SISI detecta en la situación",
    "relacion_fase": "cómo se relaciona su situación actual con lo que exige su fase",
    "relacion_ideal": {
      "clasificacion": "acerca|acerca_parcialmente|no_acerca|aleja",
      "explicacion": "por qué se clasifica así respecto al escenario ideal"
    },
    "accion_concreta": {
      "titulo": "nombre corto de la acción (máx 6 palabras)",
      "descripcion": "qué debe hacer exactamente, cómo y cuándo (2-3 oraciones)",
      "prioridad": "alta|media|baja",
      "plazo": "hoy|esta semana|este mes"
    },
    "pregunta_avance": "pregunta directa y poderosa que invita a reflexionar y actuar"
  },
  "analisis_interno": {
    "fase_estimacion": ${condicion},
    "distancia_ideal": "alta|media|baja",
    "orden_financiero": "correcto|parcial|incorrecto|sin_datos",
    "cuello_botella_principal": "el obstáculo concreto más importante que frena el avance",
    "evaluacion_acciones": [
      {"descripcion": "acción evaluada", "clasificacion": "acerca|neutra|aleja", "motivo": "por qué se clasifica así"}
    ]
  },
  "sugerencias_extra": {
    "mentor_recomendado": {
      "id": "jedi|steve|leo|ninguno",
      "nombre": "Yoda|Steve|Leonidas|ninguno",
      "motivo": "por qué este mentor aportaría valor ahora mismo"
    },
    "knowledge_link_recomendado": null
  },
  "metadata": {
    "version_prompt": "sisi_core_v1",
    "timestamp": "${new Date().toISOString()}"
  }
}
${idioma === 'en' ? 'IMPORTANT: Write ALL text values inside the JSON in English.' : ''}`
            }]
          }],
          generationConfig: { temperature: 0.65, maxOutputTokens: 4000 }
        })
      })

      if (!response.ok) throw new Error(`Error ${response.status}`)

      const data  = await response.json()
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      // Limpiar posible markdown (```json ... ```) que Gemini añade a veces
      const limpio = texto.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
      const match  = limpio.match(/\{[\s\S]*\}/)
      if (!match) {
        console.error('Texto recibido de Gemini:', texto)
        throw new Error('Respuesta inesperada de SISI')
      }

      const parsed = JSON.parse(match[0])
      if (!parsed.respuesta_usuario?.mensaje_principal) throw new Error('Respuesta incompleta')

      setRespuesta(parsed)
      await agregarXP(5)

      // ── Guardar sesión completa en Supabase ───────────────────
      const interno = parsed.analisis_interno || {}
      await supabase.from('sisi_sesiones').insert({
        user_id:             user.id,
        consulta:            consulta.trim() || null,
        fase_inicio:         condicion,
        fase_estimada:       interno.fase_estimacion || condicion,
        distancia_ideal:     interno.distancia_ideal || null,
        orden_financiero:    interno.orden_financiero || null,
        cuello_botella:      interno.cuello_botella_principal || null,
        evaluacion_acciones: interno.evaluacion_acciones || [],
        accion_titulo:       parsed.respuesta_usuario?.accion_concreta?.titulo || null,
        accion_prioridad:    parsed.respuesta_usuario?.accion_concreta?.prioridad || null,
        mentor_sugerido:     parsed.sugerencias_extra?.mentor_recomendado?.nombre || null,
        respuesta_usuario:   parsed.respuesta_usuario || null,
        payload,
      })
      cargarHistorial()

    } catch (err) {
      console.error('Error SISI:', err)
      setError('SISI no pudo analizar tu situación. Inténtalo de nuevo.')
    } finally {
      setAnalizando(false)
    }
  }

  // ─── Extraer partes de la respuesta ──────────────────────────
  const ru      = respuesta?.respuesta_usuario
  const ai      = respuesta?.analisis_interno
  const se      = respuesta?.sugerencias_extra
  const prio    = ru ? (PRIORIDAD[ru.accion_concreta?.prioridad]    || PRIORIDAD.media)  : null
  const dist    = ai ? (DISTANCIA[ai.distancia_ideal]               || DISTANCIA.media)  : null
  const relIdeal= ru ? (RELACION_IDEAL[ru.relacion_ideal?.clasificacion] || RELACION_IDEAL.no_acerca) : null
  const ordenFin= ai ? (ORDEN_FINANCIERO[ai.orden_financiero]       || ORDEN_FINANCIERO.sin_datos) : null
  const mentorId= se?.mentor_recomendado?.id
  const mentorUI= mentorId && mentorId !== 'ninguno' ? MENTORES_UI[mentorId] : null

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>

      {/* ── Header SISI ───────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(18,140,126,0.10), rgba(18,140,126,0.04))',
        border: '1px solid rgba(18,140,126,0.25)', borderRadius: 'var(--radius)',
        padding: 28, marginBottom: 24, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(18,140,126,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '2px solid rgba(18,140,126,0.5)',
            flexShrink: 0, overflow: 'hidden',
            boxShadow: '0 0 30px rgba(18,140,126,0.3)'
          }}>
            <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 4 }}>
              SISI <span style={{ color: 'rgba(18,140,126,0.7)', fontSize: '0.88rem', fontWeight: 400 }}>Inteligencia principal · Mentor AI</span>
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Interpreta tu situación, detecta el cuello de botella y propone tu siguiente paso exacto.
            </p>
          </div>
        </div>
      </div>

      {/* ── Contexto activo ───────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Contexto que SISI tiene de ti ahora
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {[
            { icon: fase.icon,  label: `Fase ${condicion}: ${fase.name}`,                                                      color: fase.color },
            { icon: '📈',       label: cargandoCtx ? '...' : `€${ctx.ingresos.toFixed(0)} ingresos este mes`,                  color: '#27AE60'  },
            { icon: '📉',       label: cargandoCtx ? '...' : `€${ctx.gastos.toFixed(0)} gastos este mes`,                      color: '#C0392B'  },
            { icon: '⚖️',       label: cargandoCtx ? '...' : `Orden financiero: ${ORDEN_FINANCIERO[calcularOrdenFinanciero()]?.label || '—'}`, color: '#F39C12' },
            { icon: '🗂️',       label: cargandoCtx ? '...' : `${ctx.proyectos} proyectos activos`,                             color: '#3498DB'  },
            { icon: '📋',       label: cargandoCtx ? '...' : (proyectoSeleccionado || ctx.proyectoPrincipal)?.plan_sisi ? `Plan: ${(proyectoSeleccionado || ctx.proyectoPrincipal).nombre}` : proyectoSeleccionado ? `Proyecto: ${proyectoSeleccionado.nombre}` : 'Sin plan de negocio aún', color: (proyectoSeleccionado || ctx.proyectoPrincipal)?.plan_sisi ? '#27AE60' : proyectoSeleccionado ? '#3498DB' : '#6B7280' },
            { icon: '📡',       label: cargandoCtx ? '...' : ctx.ultimoPulso ? `Último pulso: Fase ${ctx.ultimoPulso.condicion}` : 'Sin pulso reciente', color: '#F39C12' },
            { icon: '🔁',       label: cargandoCtx ? '...' : `${ctx.accionesRecientes.length} acciones recientes`,             color: '#128c7e'  },
          ].map((chip, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 99,
              background: 'var(--surface)', border: `1px solid ${chip.color}33`,
              fontSize: '0.77rem', color: 'var(--text-soft)'
            }}>
              <span>{chip.icon}</span>
              <span style={{ color: chip.color, fontWeight: 500 }}>{chip.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sin proyectos: SISI guía a crear uno ─────────────── */}
      {/* ── Selector de proyecto (solo si hay más de 1) ──────── */}
      {!cargandoCtx && ctx.proyectos > 1 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 16
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            ¿Sobre qué proyecto quieres consultar a SISI?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ctx.proyectosData.map(p => {
              const activo = proyectoSeleccionado?.id === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setProyectoSeleccionado(activo ? null : p)}
                  style={{
                    padding: '7px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontSize: '0.83rem', fontWeight: activo ? 700 : 400,
                    background: activo ? 'rgba(18,140,126,0.15)' : 'var(--surface2)',
                    border: activo ? '1px solid rgba(18,140,126,0.5)' : '1px solid var(--border)',
                    color: activo ? 'rgba(18,140,126,0.9)' : 'var(--text-soft)',
                    transition: 'all 0.2s'
                  }}>
                  {p.plan_sisi ? '📋 ' : '🗂️ '}{p.nombre}
                  {activo && ' ✓'}
                </button>
              )
            })}
          </div>
          {!proyectoSeleccionado && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Si no seleccionas ninguno, SISI analizará tu situación general.
            </p>
          )}
        </div>
      )}

      {/* ── Input ─────────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 24 }}>
        {!cargandoCtx && ctx.proyectos === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(18,140,126,0.06)', border: '1px solid rgba(18,140,126,0.15)' }}>
            <span style={{ fontSize: '0.82rem' }}>💡</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Si creas un proyecto en <button onClick={() => onNavigate('proyectos')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(18,140,126,0.85)', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'underline' }}>Proyectos</button>, SISI tendrá más contexto para analizarte.
            </span>
          </div>
        )}
        <p style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 12 }}>
          ⚡ ¿Qué quieres que SISI analice hoy?
        </p>
        <textarea
          value={consulta}
          onChange={e => setConsulta(e.target.value)}
          placeholder="Describe tu situación, reto o decisión actual. O deja en blanco para un análisis general basado en tus datos..."
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
            padding: '12px 14px', outline: 'none', resize: 'vertical', minHeight: 100, marginBottom: 14
          }}
        />
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: 'var(--leo)' }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={analizarConSISI}
            disabled={analizando || cargandoCtx}
            style={{
              padding: '11px 28px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: analizando || cargandoCtx ? 'var(--surface3)' : 'rgba(18,140,126,0.85)',
              color: 'white', fontWeight: 600, fontSize: '0.9rem',
              cursor: analizando || cargandoCtx ? 'not-allowed' : 'pointer',
              opacity: analizando || cargandoCtx ? 0.7 : 1
            }}>
            {analizando ? '⚡ SISI está analizando...' : '⚡ Analizar mi situación'}
          </button>
          {cargandoCtx && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cargando tu contexto...</span>}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RESPUESTA VISIBLE — respuesta_usuario
      ══════════════════════════════════════════════════════════ */}
      {ru && (
        <div className="fade-in">
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.7rem', color: 'rgba(18,140,126,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Respuesta de SISI
          </p>

          {/* 1. Mensaje principal */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(18,140,126,0.10), rgba(18,140,126,0.04))',
            border: '1px solid rgba(18,140,126,0.25)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 14
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'rgba(18,140,126,0.15)', border: '2px solid rgba(18,140,126,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.8, fontStyle: 'italic' }}>
                "{ru.mensaje_principal}"
              </p>
            </div>
          </div>

          {/* 2. Situación actual + Lectura principal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>📍 Situación actual</div>
              <p style={{ fontSize: '0.87rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>{ru.situacion_actual}</p>
            </div>
            <div style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.22)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C0392B', marginBottom: 10 }}>🔍 Lectura principal</div>
              <p style={{ fontSize: '0.87rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>{ru.lectura_principal}</p>
            </div>
          </div>

          {/* 3. Relación con la fase + Relación con el ideal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={{ background: `${fase.color}10`, border: `1px solid ${fase.color}30`, borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span>{fase.icon}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: fase.color }}>
                  Fase {condicion} — {fase.name}
                </span>
              </div>
              <p style={{ fontSize: '0.87rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>{ru.relacion_fase}</p>
            </div>
            <div style={{ background: relIdeal?.bg || 'var(--surface)', border: `1px solid ${relIdeal?.color || 'var(--border)'}33`, borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>🎯 Relación con el escenario ideal</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '4px 12px', borderRadius: 99, background: relIdeal?.bg, border: `1px solid ${relIdeal?.color}44` }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: relIdeal?.color }}>{relIdeal?.label}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>{ru.relacion_ideal?.explicacion}</p>
            </div>
          </div>

          {/* 4. Acción concreta — protagonista */}
          {ru.accion_concreta && (
            <div style={{
              background: prio?.bg, border: `1px solid ${prio?.border}`,
              borderLeft: `4px solid ${prio?.text}`,
              borderRadius: 'var(--radius)', padding: 24, marginBottom: 14
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>⚡ Acción concreta</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: prio?.bg, color: prio?.text, border: `1px solid ${prio?.border}` }}>{prio?.label}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600, background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>🕐 {ru.accion_concreta.plazo}</span>
                </div>
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 10 }}>{ru.accion_concreta.titulo}</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>{ru.accion_concreta.descripcion}</p>
            </div>
          )}

          {/* 5. Mentor sugerido — badge interactivo */}
          {mentorUI && se?.mentor_recomendado?.nombre !== 'ninguno' && (
            <div style={{ marginBottom: 14 }}>

              {/* Badge compacto clicable */}
              <button
                onClick={() => setMentorAbierto(mentorAbierto === mentorId ? null : mentorId)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, textAlign: 'left'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: `${mentorUI.color}0A`,
                  border: `1px solid ${mentorUI.color}33`,
                  borderRadius: 'var(--radius)', padding: '14px 18px',
                  transition: 'all 0.2s ease'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = `${mentorUI.color}18`}
                  onMouseLeave={e => e.currentTarget.style.background = `${mentorUI.color}0A`}
                >
                  {/* Foto mentor */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${mentorUI.color}`, overflow: 'hidden', boxShadow: `0 0 16px ${mentorUI.color}55` }}>
                      <img src={mentorUI.foto} alt={mentorUI.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {/* Indicador activo */}
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: mentorUI.color, border: '2px solid var(--surface)' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                      SISI sugiere hablar con
                    </div>
                    <div style={{ fontWeight: 700, color: mentorUI.color, fontSize: '0.95rem', marginBottom: 2 }}>
                      {se.mentor_recomendado.nombre}
                      <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>{mentorUI.badge}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {se.mentor_recomendado.motivo}
                    </div>
                  </div>

                  {/* Chevron */}
                  <span style={{ color: mentorUI.color, fontSize: '0.85rem', flexShrink: 0, transition: 'transform 0.2s', transform: mentorAbierto === mentorId ? 'rotate(180deg)' : 'none' }}>▼</span>
                </div>
              </button>

              {/* Panel expandido */}
              {mentorAbierto === mentorId && (
                <div className="fade-in" style={{
                  marginTop: 2,
                  background: `${mentorUI.color}06`,
                  border: `1px solid ${mentorUI.color}33`,
                  borderTop: 'none',
                  borderRadius: '0 0 var(--radius) var(--radius)',
                  padding: 22
                }}>
                  {!respuestaMentor && !consultandoMentor && (
                    /* Vista previa: 2 líneas de contexto + botón */
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${mentorUI.color}`, overflow: 'hidden', flexShrink: 0 }}>
                          <img src={mentorUI.foto} alt={mentorUI.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: mentorUI.color, fontSize: '0.88rem' }}>{se.mentor_recomendado.nombre}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mentorUI.badge}</div>
                        </div>
                      </div>

                      {/* 2 líneas de lo que puede aportar */}
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 16 }}>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 6 }}>
                          <strong style={{ color: mentorUI.color }}>{se.mentor_recomendado.nombre}</strong> puede darte su visión sobre este cuello de botella desde su especialidad en <em>{MENTORES_DISPONIBLES.find(m => m.id === mentorId)?.especialidad}</em>.
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          Tendrá en cuenta todo el contexto que SISI ya analizó de tu negocio para darte una respuesta personalizada.
                        </p>
                      </div>

                      <button
                        onClick={() => consultarMentor(mentorId)}
                        style={{
                          padding: '10px 22px', borderRadius: 'var(--radius-sm)',
                          background: mentorUI.color, border: 'none',
                          color: 'white', fontWeight: 700, fontSize: '0.88rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                        }}>
                        Quiero saber más →
                      </button>
                    </div>
                  )}

                  {consultandoMentor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${mentorUI.color}`, overflow: 'hidden', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }}>
                        <img src={mentorUI.foto} alt={mentorUI.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {se.mentor_recomendado.nombre} está preparando su respuesta...
                      </span>
                    </div>
                  )}

                  {respuestaMentor && !consultandoMentor && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${mentorUI.color}`, overflow: 'hidden', flexShrink: 0 }}>
                          <img src={mentorUI.foto} alt={mentorUI.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: mentorUI.color, fontSize: '0.88rem' }}>{se.mentor_recomendado.nombre}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{mentorUI.badge} · Respuesta contextualizada por SISI</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-soft)', lineHeight: 1.85, fontStyle: 'italic' }}>
                        "{respuestaMentor}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 6. Pregunta de avance */}
          <div style={{ background: 'rgba(18,140,126,0.07)', border: '1px solid rgba(18,140,126,0.2)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 16 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(18,140,126,0.7)', marginBottom: 10 }}>💬 Pregunta de avance</div>
            <p style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 500 }}>"{ru.pregunta_avance}"</p>
          </div>

          {/* ══════════════════════════════════════════════════════
              ANÁLISIS INTERNO — colapsable (no visible por defecto)
          ══════════════════════════════════════════════════════ */}
          {ai && (
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => setMostrarInterno(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                <span style={{ fontFamily: 'Sora, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔬 Análisis interno de SISI</span>
                <span>{mostrarInterno ? '▲' : '▼'}</span>
              </button>

              {mostrarInterno && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22, marginTop: 8 }}>

                  {/* Métricas internas */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                    {[
                      { label: 'Fase estimada',     value: `${ai.fase_estimacion} — ${FASES[ai.fase_estimacion]?.name || ''}` },
                      { label: 'Distancia al ideal', value: dist?.label || '—',         color: dist?.color },
                      { label: 'Orden financiero',  value: ordenFin?.label || '—',      color: ordenFin?.color },
                    ].map((m, i) => (
                      <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: m.color || 'var(--text)' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Cuello de botella principal */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>Cuello de botella principal</div>
                    <p style={{ fontSize: '0.87rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>{ai.cuello_botella_principal}</p>
                  </div>

                  {/* Evaluación de acciones */}
                  {ai.evaluacion_acciones?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>Evaluación de acciones recientes</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ai.evaluacion_acciones.map((acc, i) => {
                          const cl = EVAL_ACCION[acc.clasificacion] || EVAL_ACCION.neutra
                          return (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: cl.bg, borderRadius: 'var(--radius-sm)', border: `1px solid ${cl.color}33` }}>
                              <span style={{ fontWeight: 800, color: cl.color, fontSize: '1rem', flexShrink: 0 }}>{cl.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{acc.descripcion}</div>
                                <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>{acc.motivo}</div>
                              </div>
                              <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, color: cl.color, border: `1px solid ${cl.color}44`, flexShrink: 0 }}>{cl.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => { setRespuesta(null); setConsulta(''); setMostrarInterno(false); setMentorAbierto(null); setRespuestaMentor(null) }}
            style={{ padding: '9px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem' }}>
            ➕ Nuevo análisis
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HISTORIAL DE SESIONES CON SISI
      ══════════════════════════════════════════════════════ */}
      {historial.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Historial de sesiones con SISI — {historial.length} análisis guardados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historial.map(s => {
              const abierta   = sesionAbierta === s.id
              const ru_s      = s.respuesta_usuario
              const prio_s    = PRIORIDAD[s.accion_prioridad] || PRIORIDAD.media
              const mentorUI_s= s.mentor_sugerido && s.mentor_sugerido !== 'Ninguno'
                ? MENTORES_UI[Object.keys(MENTORES_UI).find(k => MENTORES_UI[k] && s.mentor_sugerido?.toLowerCase().includes(k))]
                : null
              const fase_s    = FASES[s.fase_estimada] || FASES[1]
              const fecha_s   = new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

              return (
                <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

                  {/* Header clickeable */}
                  <button
                    onClick={() => setSesionAbierta(abierta ? null : s.id)}
                    style={{ width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{fase_s.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.consulta || 'Análisis general'}
                        </div>
                        {s.accion_titulo && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'left', marginTop: 2 }}>
                            ⚡ {s.accion_titulo}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {s.accion_prioridad && (
                        <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: prio_s.bg, color: prio_s.text, border: `1px solid ${prio_s.border}` }}>
                          {prio_s.label}
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fecha_s}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{abierta ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Contenido expandido */}
                  {abierta && (
                    <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--border)' }}>
                      {ru_s ? (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                          {/* Mensaje principal */}
                          <div style={{ background: 'linear-gradient(135deg, rgba(18,140,126,0.08), rgba(18,140,126,0.03))', border: '1px solid rgba(18,140,126,0.2)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(18,140,126,0.7)', marginBottom: 8 }}>⚡ SISI dijo</div>
                            <p style={{ fontSize: '0.87rem', color: 'var(--text-soft)', lineHeight: 1.7, fontStyle: 'italic' }}>"{ru_s.mensaje_principal}"</p>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {/* Situación */}
                            {ru_s.situacion_actual && (
                              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>📍 Situación</div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>{ru_s.situacion_actual}</p>
                              </div>
                            )}
                            {/* Cuello de botella */}
                            {s.cuello_botella && (
                              <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.18)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C0392B', marginBottom: 6 }}>🔴 Cuello de botella</div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>{s.cuello_botella}</p>
                              </div>
                            )}
                          </div>

                          {/* Acción concreta */}
                          {ru_s.accion_concreta && (
                            <div style={{ background: prio_s.bg, border: `1px solid ${prio_s.border}`, borderLeft: `3px solid ${prio_s.text}`, borderRadius: 'var(--radius-sm)', padding: 14 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>⚡ Acción sugerida</div>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🕐 {ru_s.accion_concreta.plazo}</span>
                              </div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', marginBottom: 4 }}>{ru_s.accion_concreta.titulo}</div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>{ru_s.accion_concreta.descripcion}</p>
                            </div>
                          )}

                          {/* Mentor sugerido */}
                          {s.mentor_sugerido && s.mentor_sugerido !== 'Ninguno' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                              {mentorUI_s && (
                                <div style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${mentorUI_s.color}`, overflow: 'hidden', flexShrink: 0 }}>
                                  <img src={mentorUI_s.foto} alt={mentorUI_s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              )}
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mentor sugerido:</span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: mentorUI_s?.color || 'var(--text)' }}>{s.mentor_sugerido}</span>
                            </div>
                          )}

                          {/* Pregunta de avance */}
                          {ru_s.pregunta_avance && (
                            <div style={{ background: 'rgba(18,140,126,0.06)', border: '1px solid rgba(18,140,126,0.15)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(18,140,126,0.7)', marginBottom: 6 }}>💬 Pregunta de avance</div>
                              <p style={{ fontSize: '0.87rem', color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic', fontWeight: 500 }}>"{ru_s.pregunta_avance}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Sesión sin respuesta_usuario guardada (sesiones antiguas)
                        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {s.cuello_botella && (
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-soft)' }}>
                              <span style={{ color: '#C0392B', fontWeight: 600 }}>Cuello de botella: </span>{s.cuello_botella}
                            </div>
                          )}
                          {s.accion_titulo && (
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-soft)' }}>
                              <span style={{ color: 'rgba(18,140,126,0.8)', fontWeight: 600 }}>Acción: </span>{s.accion_titulo}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}
