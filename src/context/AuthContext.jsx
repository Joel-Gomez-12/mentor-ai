import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [xp, setXp]                     = useState(0)
  const [condicion, setCondicion]       = useState(1)
  const [fullName, setFullName]         = useState('')
  const [idioma, setIdioma]             = useState('es')
  const [tipoNegocio, setTipoNegocio]   = useState(null)
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
          cargarPerfil(session.user.id)
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
          cargarPerfil(session.user.id)
        } else {
          setXp(0)
          setCondicion(1)
          setFullName('')
          setIdioma('es')
          setTipoNegocio(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // ─── Cargar datos del usuario ────────────────────────────────────
  const cargarPerfil = async (userId) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('xp, condicion, full_name, idioma, tipo_negocio')
        .eq('id', userId)
        .single()

      if (!data) return

      setXp(data.xp || 0)
      setCondicion(data.condicion || 1)
      setFullName(data.full_name || '')
      setIdioma(data.idioma || 'es')
      setTipoNegocio(data.tipo_negocio || null)
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }

  // ─── Agregar XP y actualizar condición ──────────────────────────
  const agregarXP = async (puntos) => {
    if (!user) return
    const nuevoXP = (xp || 0) + puntos

    let nuevaCondicion = 1
    if (nuevoXP >= 10000)     nuevaCondicion = 6
    else if (nuevoXP >= 4000) nuevaCondicion = 5
    else if (nuevoXP >= 1500) nuevaCondicion = 4
    else if (nuevoXP >= 500)  nuevaCondicion = 3
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
    setXp(0)
    setCondicion(1)
  }

  const guardarTipoNegocio = async (tipo) => {
    if (!user) return
    await supabase.from('users').update({ tipo_negocio: tipo }).eq('id', user.id)
    setTipoNegocio(tipo)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      xp, condicion, fullName, idioma, tipoNegocio,
      agregarXP, guardarTipoNegocio,
      signUp, signIn, signOut,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)