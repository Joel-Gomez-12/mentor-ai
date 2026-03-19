import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [racha, setRacha]         = useState(0)
  const [xp, setXp]               = useState(0)
  const [condicion, setCondicion] = useState(1)
  const inicializado = useRef(false)

  useEffect(() => {
    if (inicializado.current) return
    inicializado.current = true

    const timeout = setTimeout(() => {
      console.warn('AuthContext: timeout activado')
      setLoading(false)
    }, 3000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          cargarRacha(session.user.id)
        }
      })
      .catch(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          cargarRacha(session.user.id)
        } else {
          setRacha(0)
          setXp(0)
          setCondicion(1)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // ─── Cargar datos del usuario ────────────────────────────────────
  const cargarRacha = async (userId) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('racha, ultima_visita, mejor_racha, xp, condicion')
        .eq('id', userId)
        .single()

      if (!data) return

      setRacha(data.racha || 0)
      setXp(data.xp || 0)
      setCondicion(data.condicion || 1)

      // Actualizar racha — fire and forget
      const hoy  = new Date().toISOString().split('T')[0]
      const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (data.ultima_visita === hoy) return

      const nuevaRacha = data.ultima_visita === ayer
        ? (data.racha || 0) + 1
        : 1

      const nuevaMejorRacha = Math.max(nuevaRacha, data.mejor_racha || 0)

      supabase.from('users').update({
        racha:         nuevaRacha,
        ultima_visita: hoy,
        mejor_racha:   nuevaMejorRacha,
      }).eq('id', userId).then(() => {
        setRacha(nuevaRacha)
      })

    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }

  // ─── Agregar XP y actualizar condición ──────────────────────────
  const agregarXP = async (puntos) => {
    if (!user) return
    const nuevoXP = (xp || 0) + puntos

    let nuevaCondicion = 1
    if (nuevoXP >= 2000)      nuevaCondicion = 6
    else if (nuevoXP >= 1000) nuevaCondicion = 5
    else if (nuevoXP >= 500)  nuevaCondicion = 4
    else if (nuevoXP >= 250)  nuevaCondicion = 3
    else if (nuevoXP >= 100)  nuevaCondicion = 2
    else                      nuevaCondicion = 1

    supabase.from('users').update({
      xp:        nuevoXP,
      condicion: nuevaCondicion,
    }).eq('id', user.id).then(() => {
      setXp(nuevoXP)
      setCondicion(nuevaCondicion)
    })
  }

  // ─── Auth ────────────────────────────────────────────────────────
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRacha(0)
    setXp(0)
    setCondicion(1)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      racha, xp, condicion,
      agregarXP,
      signUp, signIn, signOut,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)