import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [xp, setXp]                 = useState(0)
  const [condicion, setCondicion]   = useState(1)
  const [fullName, setFullName]     = useState('')
  const [idioma, setIdioma]         = useState('es')
  const [tipoNegocio, setTipoNegocio] = useState(null)
  const [sector, setSector]         = useState(null)
  const [bloqueo, setBloqueo]       = useState(null)
  const [areaFoco, setAreaFoco]     = useState(null)
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
        if (session?.user) cargarPerfil(session.user.id, session.user)
      })
      .catch(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          cargarPerfil(session.user.id, session.user)
        } else {
          setXp(0); setCondicion(1); setFullName(''); setIdioma('es')
          setTipoNegocio(null); setSector(null); setBloqueo(null); setAreaFoco(null)
        }
      }
    )

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  // ─── Cargar perfil (con fallback a metadata del usuario) ─────────
  const cargarPerfil = async (userId, authUser) => {
    try {
      const meta = authUser?.user_metadata || {}

      const { data } = await supabase
        .from('users')
        .select('xp, condicion, full_name, idioma, tipo_negocio, sector, bloqueo, area_foco')
        .eq('id', userId)
        .single()

      if (!data) return

      // El trigger de Supabase puebla full_name pero nunca sector/bloqueo/area_foco.
      // Si meta tiene sector y DB no → el usuario viene del wizard y aún no se guardó → usar metadata.
      const wizardPendiente = !!meta.sector && !data.sector

      const finalFullName  = data.full_name  || meta.full_name  || ''
      const finalCondicion = wizardPendiente ? (meta.condicion || 1) : (data.condicion || 1)
      const finalSector    = data.sector    || meta.sector    || null
      const finalBloqueo   = data.bloqueo   || meta.bloqueo   || null
      const finalAreaFoco  = data.area_foco || meta.area_foco || null

      setXp(data.xp || 0)
      setCondicion(finalCondicion)
      setFullName(finalFullName)
      setIdioma(data.idioma || 'es')
      setTipoNegocio(data.tipo_negocio || null)
      setSector(finalSector)
      setBloqueo(finalBloqueo)
      setAreaFoco(finalAreaFoco)

      // Guardar datos del wizard en DB (solo se ejecuta una vez)
      if (wizardPendiente) {
        await supabase.from('users').update({
          full_name:    meta.full_name    || data.full_name,
          condicion:    meta.condicion    || 1,
          sector:       meta.sector,
          bloqueo:      meta.bloqueo      || null,
          area_foco:    meta.area_foco    || null,
          tipo_negocio: meta.tipo_negocio || null,
        }).eq('id', userId)
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }

  // ─── Agregar XP ──────────────────────────────────────────────────
  const agregarXP = async (puntos) => {
    if (!user) return
    const nuevoXP = (xp || 0) + puntos

    let nuevaCondicion = 1
    if      (nuevoXP >= 10000) nuevaCondicion = 6
    else if (nuevoXP >= 4000)  nuevaCondicion = 5
    else if (nuevoXP >= 1500)  nuevaCondicion = 4
    else if (nuevoXP >= 500)   nuevaCondicion = 3
    else if (nuevoXP >= 100)   nuevaCondicion = 2

    supabase.from('users').update({ xp: nuevoXP, condicion: nuevaCondicion })
      .eq('id', user.id)
      .then(() => { setXp(nuevoXP); setCondicion(nuevaCondicion) })
  }

  // ─── Auth ─────────────────────────────────────────────────────────
  const signUp = async (email, password, nombre, extraData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name:    nombre,
          sector:       extraData.sector       || null,
          condicion:    extraData.condicion     || 1,
          bloqueo:      extraData.bloqueo       || null,
          area_foco:    extraData.area_foco     || null,
          tipo_negocio: extraData.tipo_negocio  || null,
        }
      }
    })
    if (error) throw error
    // Los datos del wizard quedan en user_metadata.
    // cargarPerfil los detecta vía wizardPendiente y los persiste en DB.
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setXp(0); setCondicion(1); setFullName(''); setIdioma('es')
    setTipoNegocio(null); setSector(null); setBloqueo(null); setAreaFoco(null)
  }

  const guardarTipoNegocio = async (tipo) => {
    if (!user) return
    await supabase.from('users').update({ tipo_negocio: tipo }).eq('id', user.id)
    setTipoNegocio(tipo)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      xp, condicion, fullName, idioma, tipoNegocio, sector, bloqueo, areaFoco,
      agregarXP, guardarTipoNegocio,
      signUp, signIn, signOut,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
