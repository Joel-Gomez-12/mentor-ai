import { useState } from 'react'
import Layout from '../components/layout/Layout'

const VERTICALES = [
  {
    id: 'impuestos', icon: '📊', color: '#6366F1', badge: 'nuevo',
    titulo: 'Gestión de impuestos',
    desc: 'IVA, IRPF, retenciones y deducciones. Deja de perder dinero con Hacienda.',
    contenido: {
      intro: '¿Por qué importa entender los impuestos?',
      texto: 'Como emprendedor, los impuestos no son solo una obligación: son una palanca estratégica. Quien los entiende, paga lo justo y no un céntimo más. Quien los ignora, financia al Estado sin darse cuenta.',
      secciones: [
        { titulo: '📌 IVA (Impuesto sobre el Valor Añadido)', color: '#6366F1', texto: 'El IVA no es tuyo. Lo cobras a tus clientes y se lo entregas a Hacienda cada trimestre. Tipos: general 21%, reducido 10%, superreducido 4%. Presenta el Modelo 303 cada trimestre y el resumen anual con el Modelo 390.' },
        { titulo: '📌 IRPF para autónomos', color: '#6366F1', texto: 'Si eres autónomo, aplicas una retención del 15% (7% los dos primeros años) en tus facturas a empresas. Presentas pagos fraccionados con el Modelo 130 cada trimestre.' },
        { titulo: '📌 Gastos deducibles clave', color: '#34D399', lista: ['Cuota de autónomos o salarios', 'Alquiler de oficina o parte proporcional del hogar', 'Software, herramientas y suscripciones', 'Formación relacionada con tu actividad', 'Viajes y dietas con justificante', 'Material informático y equipamiento'] },
      ],
      consejo: { mentor: '⚡ Consejo de Andrea', texto: '"Guarda todos los justificantes, aunque parezcan pequeños. Y separa desde el primer día una cuenta solo para impuestos: aparta el 25–30% de cada ingreso. Hacienda no avisa cuando llega."' }
    },
    videos: ['IVA explicado en 10 minutos', 'Cómo presentar el Modelo 303', 'IRPF para autónomos paso a paso', 'Los 10 gastos más deducibles', 'Hacienda digital: acceso y gestión']
  },
  {
    id: 'empresa', icon: '🏢', color: '#8B5CF6', badge: 'nuevo',
    titulo: 'Creación y gestión de empresa',
    desc: 'Desde la idea hasta la estructura legal. Todo lo que necesitas saber antes de constituir.',
    contenido: {
      intro: '¿Cuándo crear una empresa?',
      texto: 'Crear una empresa no es el primer paso. Es una decisión estratégica que depende de tus ingresos, tu exposición fiscal y tus socios. Entiende cuándo vale la pena dar el salto.',
      secciones: [
        { titulo: '📌 Autónomo vs Sociedad Limitada', color: '#8B5CF6', texto: 'El autónomo tributa en IRPF (escala progresiva hasta 47%). La SL tributa al 25% en Impuesto de Sociedades. El punto de equilibrio suele estar en torno a 40.000€ de beneficio neto.' },
      ],
      consejo: { mentor: '⚡ Consejo de Andrea', texto: '"No montes una SL por imagen. Móntala cuando la fiscalidad lo justifique o cuando el riesgo legal lo exija. Antes, factura como autónomo y aprende el negocio."' }
    },
    videos: ['Autónomo vs SL: ventajas y desventajas', 'Cómo constituir una SL paso a paso', 'Pacto de socios: qué incluir', 'Holding y estructuras fiscales', 'Cómo contratar a tus primeros empleados']
  },
  {
    id: 'modelos', icon: '🎯', color: '#F59E0B', badge: 'nuevo',
    titulo: 'Modelos de negocio',
    desc: 'Diseña un negocio que escale. Los modelos que generan dinero mientras duermes.',
    contenido: {
      intro: '¿Qué hace que un modelo de negocio funcione?',
      texto: 'Un buen modelo de negocio resuelve un problema real, tiene márgenes saludables y puede escalar sin que tú trabajes el doble.',
      secciones: [
        { titulo: '📌 Los modelos más rentables', color: '#F59E0B', lista: ['SaaS (Software as a Service)', 'Marketplace con comisión', 'Consultoría productizada', 'Contenido + membresía', 'Agencia con procesos sistemáticos'] },
      ],
      consejo: { mentor: '⚡ Consejo de Steve', texto: '"El mejor modelo de negocio es el que puedes explicar en una frase y que el cliente paga sin dudar. Si necesitas 10 minutos para explicarlo, rediseñalo."' }
    },
    videos: ['Los 7 modelos de negocio más rentables', 'Cómo productizar tu servicio', 'De freelance a agencia', 'Modelos SaaS para no técnicos', 'Cómo validar tu modelo antes de construir']
  },
  {
    id: 'sociedad', icon: '⚖️', color: '#EC4899', badge: 'nuevo',
    titulo: 'Modelos de sociedad',
    desc: 'SL, SA, cooperativa, holding. Elige la estructura que protege tu patrimonio y optimiza tu fiscalidad.',
    contenido: {
      intro: '¿Qué estructura legal necesitas?',
      texto: 'La estructura legal de tu negocio afecta a tu fiscalidad, tu responsabilidad personal y tu capacidad de crecer con socios o inversores.',
      secciones: [
        { titulo: '📌 Tipos de sociedades en España', color: '#EC4899', lista: ['Autónomo (sin personalidad jurídica)', 'Sociedad Limitada (SL) — la más común', 'Sociedad Anónima (SA) — para grandes empresas', 'Cooperativa — para proyectos colectivos', 'Holding — para optimizar fiscalmente grupos'] },
      ],
      consejo: { mentor: '⚡ Consejo de Andrea', texto: '"La mayoría de emprendedores solo necesita una SL bien gestionada. El holding solo tiene sentido cuando tienes varias empresas rentables."' }
    },
    videos: ['Autónomo vs SL: ventajas y desventajas', 'Cómo constituir una SL paso a paso', 'Pacto de socios: qué incluir', 'Holding y estructuras fiscales avanzadas']
  },
  {
    id: 'ventas', icon: '💼', color: '#10B981', badge: 'nuevo',
    titulo: 'Ventas y cierre',
    desc: 'Sistema de ventas para emprendedores. Desde el primer contacto hasta el contrato firmado.',
    contenido: {
      intro: '¿Por qué fallan las ventas?',
      texto: 'La mayoría de emprendedores no tiene un sistema de ventas. Improvisa en cada llamada, baja el precio cuando hay objeción y pierde clientes por falta de seguimiento.',
      secciones: [
        { titulo: '📌 El proceso de ventas en 6 pasos', color: '#10B981', lista: ['1. Prospección y calificación', '2. Primera toma de contacto', '3. Diagnóstico del problema', '4. Presentación de solución', '5. Gestión de objeciones', '6. Cierre y firma'] },
      ],
      consejo: { mentor: '⚡ Consejo de Leónidas', texto: '"Las ventas no se improvisan. Se entrenan. Graba tus llamadas, analízalas y mejora cada semana. El que más practica, más cierra."' }
    },
    videos: ['El proceso de ventas en 6 pasos', 'Cómo hacer una propuesta que no se rechaza', 'Objeciones más comunes y cómo gestionarlas', 'CRM: cuál usar y cómo estructurarlo']
  },
  {
    id: 'finanzas', icon: '💰', color: '#F59E0B', badge: 'nuevo',
    titulo: 'Finanzas para emprendedores',
    desc: 'Control de caja, márgenes, previsiones. Deja de gestionar tu empresa a ciegas.',
    contenido: {
      intro: '¿Por qué mueren negocios rentables?',
      texto: 'Muchos negocios facturan bien pero quiebran por falta de liquidez. La rentabilidad y la tesorería son cosas distintas. Aprende a gestionarlas.',
      secciones: [
        { titulo: '📌 Las 3 métricas que todo emprendedor debe conocer', color: '#F59E0B', lista: ['MRR (Monthly Recurring Revenue)', 'Margen bruto y margen neto', 'Runway: cuántos meses puedes sobrevivir'] },
      ],
      consejo: { mentor: '⚡ Consejo de Andrea', texto: '"Revisa tus números cada lunes. 15 minutos. Ingresos de la semana, gastos pendientes, saldo en cuenta. Los emprendedores que hacen esto no tienen sustos."' }
    },
    videos: ['Tesorería vs Rentabilidad', 'Cómo hacer una previsión financiera', 'Control de gastos para autónomos', 'Cuándo necesitas financiación externa', 'Métricas clave para tu negocio']
  },
  {
    id: 'marketing', icon: '📣', color: '#F87171', badge: 'nuevo',
    titulo: 'Marketing y captación',
    desc: 'Atrae clientes sin depender de referencias. Canales, mensajes y sistemas que funcionan.',
    contenido: {
      intro: '¿Cómo conseguir clientes de forma predecible?',
      texto: 'El marketing no es magia. Es un sistema. Los emprendedores que crecen tienen canales de captación definidos y los optimizan semana a semana.',
      secciones: [
        { titulo: '📌 Los canales más efectivos para emprendedores', color: '#F87171', lista: ['LinkedIn (B2B)', 'Instagram / TikTok (B2C)', 'SEO y contenido orgánico', 'Email marketing', 'Referidos y partnerships'] },
      ],
      consejo: { mentor: '⚡ Consejo de Steve', texto: '"Elige UN canal y domínalo antes de diversificar. El emprendedor que está en todos lados no está en ninguno."' }
    },
    videos: ['Estrategia de contenido en LinkedIn', 'Email marketing desde cero', 'SEO básico para emprendedores', 'Cómo crear un sistema de referidos', 'Publicidad pagada: cuándo y cómo']
  },
  {
    id: 'liderazgo', icon: '🧠', color: '#C7D2FE', badge: 'nuevo',
    titulo: 'Liderazgo y mentalidad',
    desc: 'El negocio crece hasta donde crece el líder. Trabaja la mentalidad que lo sostiene todo.',
    contenido: {
      intro: '¿Por qué la mentalidad es el activo más importante?',
      texto: 'Puedes tener el mejor producto del mundo, pero si tu mentalidad no está alineada con el crecimiento, sabotearás tu propio éxito.',
      secciones: [
        { titulo: '📌 Las creencias que frenan a los emprendedores', color: '#C7D2FE', lista: ['"No soy lo suficientemente bueno"', '"El mercado ya está saturado"', '"Necesito más formación antes de empezar"', '"Si bajo el precio, conseguiré más clientes"', '"No tengo tiempo"'] },
      ],
      consejo: { mentor: '⚡ Consejo de Jedi', texto: '"La mentalidad no se cambia leyendo libros. Se cambia actuando a pesar del miedo, y viendo que sobrevives. Cada acción valiente reprograma tu sistema de creencias."' }
    },
    videos: ['Mentalidad de crecimiento vs mentalidad fija', 'Cómo gestionar el síndrome del impostor', 'Productividad para emprendedores', 'Toma de decisiones bajo presión', 'Cómo construir hábitos de alto rendimiento']
  },
  {
    id: 'confianza', icon: '🤝', color: '#F0B429', badge: 'pronto',
    titulo: 'Personas de confianza',
    desc: 'Cómo identificar, atraer y trabajar con asesores, socios y colaboradores de confianza.',
    contenido: {
      intro: '¿A quién necesitas a tu lado?',
      texto: 'El emprendedor solitario tiene un techo bajo. Los que más lejos llegan se rodean de las personas correctas en el momento correcto.',
      secciones: [
        { titulo: '📌 Los 4 perfiles que todo emprendedor necesita', color: '#F0B429', lista: ['El asesor fiscal y legal', 'El mentor o advisor', 'El socio complementario', 'El equipo de confianza'] },
      ],
      consejo: { mentor: '⚡ Consejo de Andrea', texto: '"Antes de buscar inversores, busca un buen asesor fiscal. Te ahorrará más dinero del que imaginas."' }
    },
    videos: ['El perfil del asesor que todo emprendedor necesita', 'Cómo evaluar un socio antes de firmar', 'Redes de contacto: calidad vs cantidad', 'Mentores reales: cómo encontrarlos']
  },
  {
    id: 'productividad', icon: '⚡', color: '#34D399', badge: 'nuevo',
    titulo: 'Productividad y sistemas',
    desc: 'Trabaja menos horas con más impacto. Sistemas, herramientas y procesos que escalan.',
    contenido: {
      intro: '¿Por qué trabajar más no es la solución?',
      texto: 'El emprendedor ocupado es el peor emprendedor. La productividad real no es hacer más cosas, sino hacer las cosas correctas en el momento correcto.',
      secciones: [
        { titulo: '📌 El sistema de productividad del emprendedor', color: '#34D399', lista: ['Time blocking: bloquea tu tiempo como reuniones', 'La regla 80/20: el 20% de acciones genera el 80% de resultados', 'Batch processing: agrupa tareas similares', 'Automatiza lo repetitivo antes de delegarlo', 'Revisión semanal: 30 minutos cada viernes'] },
      ],
      consejo: { mentor: '⚡ Consejo de Jedi', texto: '"La productividad no es velocidad. Es dirección. Moverse rápido en la dirección equivocada es el error más costoso que puedes cometer."' }
    },
    videos: ['Time blocking para emprendedores', 'Las mejores herramientas de productividad', 'Cómo delegar correctamente', 'Automatización sin código', 'La revisión semanal que cambia todo']
  },
]

export default function Formacion({ onNavigate, currentPage }) {
  const [busqueda, setBusqueda] = useState('')
  const [verticalActiva, setVerticalActiva] = useState(VERTICALES[0])
  const [tabActiva, setTabActiva] = useState('contenido')

  const filtradas = VERTICALES.filter(v =>
    !busqueda || v.titulo.toLowerCase().includes(busqueda.toLowerCase()) || v.desc.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Biblioteca de formación
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        Todo el conocimiento que necesitas, organizado por verticales. Directo y sin ruido.
      </p>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar vertical o módulo..."
          style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '12px 14px 12px 42px', fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

        {/* Sidebar verticales */}
        <div style={{ borderRight: '1px solid var(--border)', overflow: 'auto', maxHeight: '70vh' }}>
          <div style={{ padding: '12px 16px', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--border)' }}>
            {filtradas.length} verticales
          </div>
          {filtradas.map(v => (
            <button
              key={v.id}
              onClick={() => { setVerticalActiva(v); setTabActiva('contenido') }}
              style={{
                width: '100%', padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                background: verticalActiva?.id === v.id ? 'var(--indigo-dim)' : 'transparent',
                borderLeft: `3px solid ${verticalActiva?.id === v.id ? v.color : 'transparent'}`,
                border: 'none', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all var(--transition)'
              }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{v.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: verticalActiva?.id === v.id ? 'var(--text)' : 'var(--text-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {v.titulo}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{v.videos?.length || 5} videos</div>
              </div>
              <span style={{
                fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 99, flexShrink: 0,
                background: v.badge === 'nuevo' ? 'var(--indigo-dim)' : 'var(--surface3)',
                color: v.badge === 'nuevo' ? 'var(--indigo)' : 'var(--text-muted)',
                border: `1px solid ${v.badge === 'nuevo' ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                textTransform: 'uppercase'
              }}>
                {v.badge === 'nuevo' ? 'NEW' : 'Pronto'}
              </span>
            </button>
          ))}
        </div>

        {/* Panel derecho */}
        {verticalActiva && (
          <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.6rem' }}>{verticalActiva.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>{verticalActiva.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{verticalActiva.desc}</div>
                </div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                background: verticalActiva.badge === 'nuevo' ? 'var(--indigo-dim)' : 'var(--surface3)',
                color: verticalActiva.badge === 'nuevo' ? 'var(--indigo)' : 'var(--text-muted)',
                border: `1px solid ${verticalActiva.badge === 'nuevo' ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              }}>
                {verticalActiva.badge === 'nuevo' ? 'Disponible' : 'Próximamente'}
              </span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
              {[['contenido', '📄 Contenido'], ['videos', `🎬 Videos (${verticalActiva.videos?.length || 0})`]].map(([t, label]) => (
                <button key={t} onClick={() => setTabActiva(t)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', background: 'transparent', border: 'none',
                    fontSize: '0.85rem', fontWeight: tabActiva === t ? 600 : 400,
                    color: tabActiva === t ? 'var(--text)' : 'var(--text-muted)',
                    borderBottom: `2px solid ${tabActiva === t ? verticalActiva.color : 'transparent'}`,
                    transition: 'all var(--transition)'
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Contenido */}
            <div style={{ padding: 24 }}>
              {tabActiva === 'contenido' && verticalActiva.contenido && (
                <div className="fade-in">
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>
                    {verticalActiva.contenido.intro}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 20 }}>
                    {verticalActiva.contenido.texto}
                  </p>

                  {verticalActiva.contenido.secciones.map((s, i) => (
                    <div key={i} style={{ borderLeft: `3px solid ${s.color}`, paddingLeft: 16, marginBottom: 20 }}>
                      <p style={{ fontWeight: 700, color: s.color, marginBottom: 8, fontSize: '0.92rem' }}>{s.titulo}</p>
                      {s.texto && <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>{s.texto}</p>}
                      {s.lista && (
                        <ul style={{ paddingLeft: 16 }}>
                          {s.lista.map((item, j) => (
                            <li key={j} style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: 4, lineHeight: 1.6 }}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {/* Consejo */}
                  {verticalActiva.contenido.consejo && (
                    <div style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 'var(--radius-sm)', padding: 16, marginTop: 8 }}>
                      <p style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: 6, fontSize: '0.85rem' }}>
                        {verticalActiva.contenido.consejo.mentor}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.7 }}>
                        {verticalActiva.contenido.consejo.texto}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {tabActiva === 'videos' && (
                <div className="fade-in">
                  {verticalActiva.videos?.map((v, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: 14, borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', background: 'var(--surface2)',
                      cursor: 'pointer', marginBottom: 10, transition: 'all var(--transition)'
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = verticalActiva.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ width: 52, height: 38, borderRadius: 6, background: 'var(--surface3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                        🎬
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{v}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>🎬 Video · {verticalActiva.titulo}</div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--surface3)', padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>
                        {10 + i * 3} min
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}