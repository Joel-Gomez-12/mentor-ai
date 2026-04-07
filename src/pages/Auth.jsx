import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LOGO_SVG = (
  <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const FEATURES = [
  { icon: '⚡', title: 'SISI — Inteligencia principal', desc: 'Tu IA analiza tu negocio en tiempo real y detecta el cuello de botella exacto.' },
  { icon: '🧙', title: 'Mentores especializados', desc: 'Pablo, Jedi, Steve y Leo responden tus dudas con contexto completo de tu situación.' },
  { icon: '📊', title: 'Pulso del negocio', desc: 'Mide tu orden financiero, avanza por fases y sabe exactamente dónde estás.' },
]

export default function Auth() {
  const [isLogin, setIsLogin]   = useState(true)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [message, setMessage]   = useState(null)
  const [focused, setFocused]   = useState(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      if (isLogin) {
        await signIn(email, password)
        window.location.href = '/'
      } else {
        await signUp(email, password, fullName)
        setMessage('¡Cuenta creada! Revisa tu email para confirmar.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setMessage(null)
    setEmail('')
    setPassword('')
    setFullName('')
  }

  const inputStyle = (field) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === field ? '#7C3AED' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 12,
    color: '#fff',
    padding: '13px 16px',
    fontSize: '0.92rem',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080A12', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── LADO IZQUIERDO — Branding ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px',
        background: 'linear-gradient(135deg, #0D0F1C 0%, #130D2E 60%, #0D0F1C 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow decorativo */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(240,180,41,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          {LOGO_SVG}
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.02em' }}>
            Mentor<span style={{ color: '#F0B429' }}> AI</span>
          </span>
        </div>

        {/* Headline */}
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.4rem', lineHeight: 1.2, color: '#fff', marginBottom: 16, letterSpacing: '-0.03em' }}>
          Tu segundo<br />
          <span style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>cerebro empresarial</span>
        </h2>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 52, maxWidth: 420 }}>
          La plataforma de inteligencia artificial diseñada para emprendedores que quieren crecer con claridad y sin perder el rumbo.
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Badges de usuarios */}
        <div style={{ marginTop: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex' }}>
            {['E', 'P', 'U'].map((l, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${260 + i * 30},60%,50%)`, border: '2px solid #080A12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -10 : 0 }}>{l}</div>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
            Emprendedores ya usando Mentor AI
          </p>
        </div>
      </div>

      {/* ── LADO DERECHO — Formulario ── */}
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', background: '#0B0D1A' }}>

        {/* Header del formulario */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff', marginBottom: 8 }}>
            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            {isLogin ? 'Accede a tu panel de Mentor AI' : 'Empieza gratis, sin tarjeta de crédito'}
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.84rem', color: '#F87171', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0 }}>⚠️</span> {error}
          </div>
        )}
        {message && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.84rem', color: '#4ADE80', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0 }}>✅</span> {message}
          </div>
        )}

        {/* Campos */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                style={inputStyle('nombre')}
                onFocus={() => setFocused('nombre')}
                onBlur={() => setFocused(null)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={inputStyle('email')}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Contraseña
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle('pass'), paddingRight: 48 }}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '1rem', padding: 0, lineHeight: 1 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {!isLogin && (
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Mínimo 6 caracteres</p>
            )}
          </div>

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '14px',
              borderRadius: 12,
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.01em',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(124,58,237,0.35)',
              transition: 'all 0.2s',
            }}>
            {loading
              ? '⏳ Procesando...'
              : isLogin
              ? '→ Iniciar sesión'
              : '→ Crear mi cuenta'}
          </button>
        </form>

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
            {isLogin ? '¿Primera vez aquí?' : '¿Ya tienes cuenta?'}
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Toggle modo */}
        <button
          onClick={switchMode}
          style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#A78BFA', fontWeight: 600, fontSize: '0.88rem',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          {isLogin ? 'Crear cuenta nueva' : 'Ya tengo cuenta — Iniciar sesión'}
        </button>

        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
          Al continuar aceptas los términos de uso de Mentor AI.<br />
          Tus datos se almacenan de forma segura.
        </p>
      </div>
    </div>
  )
}
