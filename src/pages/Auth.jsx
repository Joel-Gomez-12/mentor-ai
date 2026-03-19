import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  setMessage(null)

  try {
    if (isLogin) {
      await signIn(email, password)
      window.location.href = '/'  // ← forzar redirección directa
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}>

      <div className="w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

        {/* Logo / título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            Mentor AI
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-400"
            style={{ backgroundColor: '#2d1515' }}>
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-lg text-sm text-green-400"
            style={{ backgroundColor: '#152d1a' }}>
            {message}
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)'
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-2 transition-opacity"
            style={{ backgroundColor: '#7C3AED', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </div>

        {/* Toggle login/registro */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null) }}
            className="text-purple-400 hover:text-purple-300"
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}