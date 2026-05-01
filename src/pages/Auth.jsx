import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LOGO_SVG = (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" stroke="#F0B429" strokeWidth="2.5" fill="none"/>
    <circle cx="32" cy="32" r="10" fill="#F0B429" opacity="0.15" stroke="#F0B429" strokeWidth="1.5"/>
    <circle cx="32" cy="32" r="4" fill="#F0B429"/>
    <path d="M14 28 Q18 18 28 20 Q24 10 36 12 Q44 8 48 18 Q56 20 54 30 Q58 40 50 44 Q48 54 38 52 Q34 58 26 54 Q16 54 14 44 Q8 38 14 28Z" stroke="#F0B429" strokeWidth="2" fill="none"/>
    <path d="M24 28 Q28 22 34 24" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M32 18 Q36 22 34 28" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M20 38 Q24 44 30 42" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M36 40 Q42 42 44 36" stroke="#F0B429" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <rect x="30" y="2"  width="4" height="6" rx="1" fill="#F0B429"/>
    <rect x="30" y="56" width="4" height="6" rx="1" fill="#F0B429"/>
    <rect x="2"  y="30" width="6" height="4" rx="1" fill="#F0B429"/>
    <rect x="56" y="30" width="6" height="4" rx="1" fill="#F0B429"/>
  </svg>
)

const SECTORS = [
  'Consultoría y asesoría',
  'Tecnología y software',
  'Salud y bienestar',
  'Comercio y retail',
  'Hostelería y restauración',
  'Educación y formación',
  'Construcción e inmobiliaria',
  'Industria y manufactura',
  'Marketing y comunicación',
  'Finanzas y seguros',
  'Arte, diseño y creatividad',
  'Otro sector',
]

const FASES = [
  { num: 1, icon: '💀', label: 'Inexistencia',  color: '#6B7280', desc: 'Tengo una idea pero aún no he empezado a facturar' },
  { num: 2, icon: '🌱', label: 'Nacimiento',    color: '#16A34A', desc: 'Acabo de empezar, buscando mis primeros clientes' },
  { num: 3, icon: '⚔️', label: 'Supervivencia', color: '#C0392B', desc: 'Tengo clientes pero el negocio aún no cubre todos sus costes' },
  { num: 4, icon: '📊', label: 'Estabilidad',   color: '#F39C12', desc: 'Ingresos estables y recurrentes, quiero consolidar' },
  { num: 5, icon: '🚀', label: 'Expansión',     color: '#3498DB', desc: 'El negocio funciona y estoy buscando escalar' },
  { num: 6, icon: '👑', label: 'Dominio',       color: '#27AE60', desc: 'Tengo un sistema que funciona sin depender de mí' },
]

const BLOQUEOS = [
  { id: 'empezar',    icon: '🧭', label: 'No sé por dónde empezar',        sub: 'Me pierdo entre ideas y no avanzo' },
  { id: 'estructura', icon: '🔧', label: 'Me falta estructura y sistema',   sub: 'Trabajo mucho pero sin orden ni proceso' },
  { id: 'clientes',   icon: '🔔', label: 'No consigo suficientes clientes', sub: 'Tengo el producto pero no la venta' },
  { id: 'tiempo',     icon: '⚡', label: 'No tengo tiempo para todo',       sub: 'El negocio me consume y no puedo crecer' },
]

const AREAS = [
  { id: 'ventas',     icon: '⚔️', label: 'Ventas',             sub: 'Conseguir y cerrar más clientes' },
  { id: 'estrategia', icon: '♟️', label: 'Estrategia',         sub: 'Decisiones, estructura y rumbo' },
  { id: 'vision',     icon: '💡', label: 'Visión e innovación', sub: 'Producto, diferenciación y futuro' },
  { id: 'finanzas',   icon: '💰', label: 'Finanzas',           sub: 'Rentabilidad, caja y control' },
  { id: 'todo',       icon: '✦',  label: 'Todo a la vez',      sub: 'SISI coordina según el momento' },
]

const TIPOS_NEGOCIO = [
  { id: 'fisico',  icon: '🏪', label: 'Negocio físico', sub: 'Local, empleados, stock, instalaciones' },
  { id: 'online',  icon: '💻', label: 'Negocio online',  sub: 'SaaS, e-commerce, infoproductos, servicios digitales' },
  { id: 'hibrido', icon: '🔀', label: 'Híbrido',         sub: 'Presencia física y canal online' },
]

// ─── Componentes de UI ───────────────────────────────────────────────────────

function SisiMessage({ text }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: '2px solid #128c7e', flexShrink: 0 }}>
          <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#128c7e', letterSpacing: '0.09em', textTransform: 'uppercase' }}>SISI</span>
      </div>
      <div style={{ background: '#ffffff', border: '1px solid rgba(18,140,126,0.13)', borderRadius: '0 16px 16px 16px', padding: '13px 17px', fontSize: '0.95rem', color: '#0c2420', lineHeight: 1.6, boxShadow: '0 2px 8px rgba(18,140,126,0.05)' }}>
        {text}
      </div>
    </div>
  )
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#128c7e' }}>Paso {current} de {total}</span>
        <span style={{ fontSize: '0.7rem', color: '#72aaa1' }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: '#e2f5f0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #128c7e, #1aad9e)', borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function OptionCard({ selected, onClick, icon, label, sub }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', background: selected ? 'rgba(18,140,126,0.06)' : '#ffffff', border: `1.5px solid ${selected ? '#128c7e' : 'rgba(18,140,126,0.13)'}`, borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', marginBottom: 9 }}
    >
      {icon && (
        <div style={{ width: 38, height: 38, borderRadius: 10, background: selected ? 'rgba(18,140,126,0.1)' : '#f0faf8', border: `1px solid ${selected ? 'rgba(18,140,126,0.25)' : 'rgba(18,140,126,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.87rem', color: '#0c2420' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.73rem', color: '#72aaa1', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected ? '#128c7e' : '#cce8e3'}`, background: selected ? '#128c7e' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  )
}

function PrimaryBtn({ label, onClick, type = 'button', disabled = false, loading = false }) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      style={{ width: '100%', padding: '14px', borderRadius: 13, background: disabled ? '#e2f5f0' : 'linear-gradient(135deg, #0f7a6d, #128c7e)', border: 'none', color: disabled ? '#88bdb6' : '#ffffff', fontWeight: 700, fontSize: '0.92rem', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', boxShadow: disabled ? 'none' : '0 4px 14px rgba(18,140,126,0.25)', marginTop: 4 }}
    >
      {loading ? '⏳ Procesando...' : label}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', color: '#128c7e', cursor: 'pointer', fontSize: '0.84rem', marginBottom: 22, padding: 0, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}
    >
      ← Volver
    </button>
  )
}

function PageWrap({ children, center = false }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0faf8', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', padding: '32px 20px', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {children}
      </div>
    </div>
  )
}

function ErrorBanner({ text }) {
  return (
    <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '11px 15px', marginBottom: 16, fontSize: '0.83rem', color: '#dc2626' }}>
      ⚠️ {text}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function Auth() {
  // mode: 'landing' | 'login' | 'wizard'
  const [mode, setMode]       = useState('landing')
  const [step, setStep]       = useState(1)

  // Datos del wizard
  const [fullName,    setFullName]    = useState('')
  const [sector,      setSector]      = useState('')
  const [tipoNegocio, setTipoNegocio] = useState(null)
  const [fase,        setFase]        = useState(null)
  const [bloqueo,     setBloqueo]     = useState(null)
  const [areaFoco,    setAreaFoco]    = useState(null)
  const [email,       setEmail]       = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)

  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [success,   setSuccess]   = useState(false)

  const { signIn, signUp } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await signIn(email, password)
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const data = await signUp(email, password, fullName, {
        sector, condicion: fase, bloqueo, area_foco: areaFoco, tipo_negocio: tipoNegocio,
      })
      if (data?.session) {
        window.location.href = '/'
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setError(null)
    if (step === 1) setMode('landing')
    else setStep(s => s - 1)
  }

  const inputStyle = {
    width: '100%', background: '#ffffff',
    border: '1.5px solid rgba(18,140,126,0.2)',
    borderRadius: 13, color: '#0c2420',
    padding: '13px 16px', fontSize: '0.92rem',
    outline: 'none', fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: '0.71rem', fontWeight: 700,
    color: '#4d8a82', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.07em',
  }

  // ── LANDING ─────────────────────────────────────────────────────────────────
  if (mode === 'landing') return (
    <PageWrap center>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        {LOGO_SVG}
        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#0c2420', letterSpacing: '-0.02em' }}>
          Mentor<span style={{ color: '#128c7e' }}> AI</span>
        </span>
      </div>

      {/* Tagline */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.7rem', color: '#0c2420', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 10 }}>
          Potencia tu negocio<br /><span style={{ color: '#128c7e' }}>cada día.</span>
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#72aaa1', lineHeight: 1.6 }}>
          Tu asistente de inteligencia empresarial siempre disponible.
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
        {[
          { icon: '⚡', label: 'Potencia mi día' },
          { icon: '🗂️', label: 'Vamos con el proyecto' },
          { icon: '📊', label: 'Ayúdame a crecer' },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 99,
            background: 'rgba(18,140,126,0.07)', border: '1px solid rgba(18,140,126,0.18)',
            fontSize: '0.8rem', color: '#128c7e', fontWeight: 500,
            cursor: 'default'
          }}>
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>

      {/* SISI intro */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#ffffff', border: '1px solid rgba(18,140,126,0.12)', borderRadius: 18, padding: '18px 20px', boxShadow: '0 2px 14px rgba(18,140,126,0.06)', marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: '2px solid #128c7e', flexShrink: 0, boxShadow: '0 0 14px rgba(18,140,126,0.16)' }}>
          <img src="/mentores/sisi.jpg" alt="SISI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#128c7e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>SISI — IA Principal</div>
          <p style={{ fontSize: '0.9rem', color: '#0c2420', lineHeight: 1.65, margin: 0 }}>
            Hola. Soy SISI. Antes de empezar, necesito hacerte unas preguntas para entender dónde estás y qué necesitas.{' '}
            <span style={{ color: '#72aaa1', fontSize: '0.82rem' }}>Solo tardarás 2 minutos.</span>
          </p>
        </div>
      </div>

      <button
        onClick={() => { setMode('wizard'); setStep(1) }}
        style={{ width: '100%', padding: '15px', borderRadius: 13, background: 'linear-gradient(135deg, #0f7a6d, #128c7e)', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.97rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(18,140,126,0.28)', marginBottom: 13 }}
      >
        Empezar
      </button>
      <button
        onClick={() => setMode('login')}
        style={{ width: '100%', padding: '13px', borderRadius: 13, background: 'transparent', border: '1.5px solid rgba(18,140,126,0.22)', color: '#128c7e', fontWeight: 600, fontSize: '0.87rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
      >
        Ya tengo cuenta — Iniciar sesión
      </button>
    </PageWrap>
  )

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  if (mode === 'login') return (
    <PageWrap>
      <BackBtn onClick={() => setMode('landing')} />

      <SisiMessage text="Bienvenido de vuelta. ¿Cuáles son tus datos de acceso?" />

      {error && <ErrorBanner text={error} />}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ ...inputStyle, paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#72aaa1', fontSize: '1rem', padding: 0 }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <PrimaryBtn label="→ Iniciar sesión" type="submit" disabled={!email || !password} loading={loading} />
      </form>

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <button
          onClick={() => { setMode('wizard'); setStep(1) }}
          style={{ background: 'none', border: 'none', color: '#128c7e', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'DM Sans, sans-serif' }}
        >
          ¿Primera vez aquí? Crea tu cuenta
        </button>
      </div>
    </PageWrap>
  )

  // ── ÉXITO (confirmación de email pendiente) ───────────────────────────────────
  if (success) return (
    <PageWrap center>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.2rem', marginBottom: 18 }}>📧</div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#0c2420', marginBottom: 12 }}>
          ¡Ya casi estás!
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#4d8a82', lineHeight: 1.72, marginBottom: 28 }}>
          Hemos enviado un email de confirmación a{' '}
          <strong style={{ color: '#0c2420' }}>{email}</strong>.<br />
          Confírmalo y luego inicia sesión.
        </p>
        <button
          onClick={() => { setSuccess(false); setMode('login') }}
          style={{ width: '100%', padding: '14px', borderRadius: 13, background: 'linear-gradient(135deg, #0f7a6d, #128c7e)', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 14px rgba(18,140,126,0.25)' }}
        >
          Ir a iniciar sesión
        </button>
      </div>
    </PageWrap>
  )

  // ── WIZARD ───────────────────────────────────────────────────────────────────
  return (
    <PageWrap>
      <BackBtn onClick={goBack} />

      {step <= 6 && <ProgressBar current={step} total={6} />}

      {/* ── Paso 1: Nombre ── */}
      {step === 1 && (
        <>
          <SisiMessage text="¡Hola! ¿Cuál es tu nombre completo?" />
          <input
            type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Escribe tu nombre completo..." autoFocus
            onKeyDown={e => e.key === 'Enter' && fullName.trim().length > 1 && setStep(2)}
            style={{ ...inputStyle, borderRadius: 13, padding: '14px 17px', fontSize: '0.97rem', boxShadow: '0 2px 8px rgba(18,140,126,0.05)', marginBottom: 14 }}
          />
          <PrimaryBtn label="Continuar →" disabled={fullName.trim().length < 2} onClick={() => setStep(2)} />
        </>
      )}

      {/* ── Paso 2: Sector ── */}
      {step === 2 && (
        <>
          <SisiMessage text={`Encantada, ${fullName.split(' ')[0]}. ¿A qué sector pertenece tu negocio?`} />
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <select
              value={sector} onChange={e => setSector(e.target.value)}
              style={{ ...inputStyle, color: sector ? '#0c2420' : '#72aaa1', padding: '14px 42px 14px 17px', appearance: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(18,140,126,0.05)' }}
            >
              <option value="">Selecciona tu sector...</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: '#128c7e', pointerEvents: 'none', fontSize: '0.72rem' }}>▼</div>
          </div>
          <PrimaryBtn label="Continuar →" disabled={!sector} onClick={() => setStep(3)} />
        </>
      )}

      {/* ── Paso 3: Tipo de negocio ── */}
      {step === 3 && (
        <>
          <SisiMessage text="¿Cómo opera tu negocio actualmente?" />
          <div style={{ marginBottom: 14 }}>
            {TIPOS_NEGOCIO.map(t => (
              <OptionCard key={t.id} selected={tipoNegocio === t.id} onClick={() => setTipoNegocio(t.id)} icon={t.icon} label={t.label} sub={t.sub} />
            ))}
          </div>
          <PrimaryBtn label="Continuar →" disabled={!tipoNegocio} onClick={() => setStep(4)} />
        </>
      )}

      {/* ── Paso 4: Fase ── */}
      {step === 4 && (
        <>
          <SisiMessage text="Estas son las 6 fases por las que pasa todo negocio. ¿En cuál te encuentras ahora mismo?" />

          {/* Stepper de fases */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            {FASES.map((f, i) => (
              <div key={f.num} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setFase(f.num)}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: `2.5px solid ${f.color}`, background: fase === f.num ? f.color : '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 0, flexShrink: 0, fontSize: fase === f.num ? '0.85rem' : '0.75rem', opacity: fase !== null && fase !== f.num ? 0.55 : 1 }}
                >
                  {f.icon}
                </button>
                {i < FASES.length - 1 && <div style={{ width: 12, height: 2, background: '#e2f5f0' }} />}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            {FASES.map(f => (
              <button
                key={f.num} onClick={() => setFase(f.num)}
                style={{ width: '100%', background: fase === f.num ? `${f.color}12` : '#ffffff', border: `1.5px solid ${fase === f.num ? f.color : 'rgba(18,140,126,0.1)'}`, borderRadius: 13, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 8, textAlign: 'left', transition: 'all 0.15s' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${f.color}18`, border: `1.5px solid ${f.color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: f.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>FASE {f.num}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.87rem', color: '#0c2420', marginBottom: 1 }}>{f.label}</div>
                  <div style={{ fontSize: '0.71rem', color: '#72aaa1' }}>{f.desc}</div>
                </div>
                {fase === f.num && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.62rem', color: '#fff' }}>
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
          <PrimaryBtn label="Continuar →" disabled={fase === null} onClick={() => setStep(5)} />
        </>
      )}

      {/* ── Paso 5: Bloqueo ── */}
      {step === 5 && (
        <>
          <SisiMessage text="¿Cuál es tu mayor bloqueo ahora mismo?" />
          <div style={{ marginBottom: 14 }}>
            {BLOQUEOS.map(b => (
              <OptionCard key={b.id} selected={bloqueo === b.id} onClick={() => setBloqueo(b.id)} icon={b.icon} label={b.label} sub={b.sub} />
            ))}
          </div>
          <PrimaryBtn label="Continuar →" disabled={!bloqueo} onClick={() => setStep(6)} />
        </>
      )}

      {/* ── Paso 6: Área ── */}
      {step === 6 && (
        <>
          <SisiMessage text="¿En qué área quieres que te ayudemos más?" />
          <div style={{ marginBottom: 14 }}>
            {AREAS.map(a => (
              <OptionCard key={a.id} selected={areaFoco === a.id} onClick={() => setAreaFoco(a.id)} icon={a.icon} label={a.label} sub={a.sub} />
            ))}
          </div>
          <PrimaryBtn label="Continuar →" disabled={!areaFoco} onClick={() => setStep(7)} />
        </>
      )}

      {/* ── Paso 7: Crear cuenta ── */}
      {step === 7 && (
        <>
          <SisiMessage text={`Perfecto, ${fullName.split(' ')[0]}. Ahora crea tu cuenta para guardar todo y acceder siempre.`} />

          {/* Resumen del perfil */}
          <div style={{ background: 'rgba(18,140,126,0.05)', border: '1px solid rgba(18,140,126,0.14)', borderRadius: 13, padding: '13px 17px', marginBottom: 20 }}>
            <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#128c7e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>Tu perfil inicial</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem', color: '#0c2420' }}>
              <div><span style={{ color: '#72aaa1' }}>Nombre:</span> {fullName}</div>
              <div><span style={{ color: '#72aaa1' }}>Sector:</span> {sector}</div>
              <div><span style={{ color: '#72aaa1' }}>Tipo:</span> {TIPOS_NEGOCIO.find(t => t.id === tipoNegocio)?.icon} {TIPOS_NEGOCIO.find(t => t.id === tipoNegocio)?.label}</div>
              <div><span style={{ color: '#72aaa1' }}>Fase:</span> {FASES.find(f => f.num === fase)?.icon} {FASES.find(f => f.num === fase)?.label}</div>
              <div><span style={{ color: '#72aaa1' }}>Bloqueo:</span> {BLOQUEOS.find(b => b.id === bloqueo)?.label}</div>
              <div><span style={{ color: '#72aaa1' }}>Área de enfoque:</span> {AREAS.find(a => a.id === areaFoco)?.label}</div>
            </div>
          </div>

          {error && <ErrorBanner text={error} />}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required autoFocus style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  required minLength={6}
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#72aaa1', fontSize: '1rem', padding: 0 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <p style={{ fontSize: '0.71rem', color: '#72aaa1', marginTop: 6 }}>Mínimo 6 caracteres</p>
            </div>
            <PrimaryBtn label="→ Crear mi cuenta" type="submit" disabled={!email || password.length < 6} loading={loading} />
          </form>

          <p style={{ fontSize: '0.71rem', color: '#72aaa1', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            Al continuar aceptas los términos de uso de Mentor AI.
          </p>
        </>
      )}
    </PageWrap>
  )
}
