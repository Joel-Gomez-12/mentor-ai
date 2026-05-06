import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// ─── Umbrales económicos por condición (camino al millón) ────────
const UMBRAL_INGRESOS = { 1: 0, 2: 0, 3: 1000, 4: 5000, 5: 25000, 6: 83333 }

// Midpoints de los rangos declarados en el diagnóstico inicial
const INGRESOS_RANGO_VALOR = {
  '€0 (sin ingresos)':   0,
  'Menos de €1.000':     500,
  '€1.000 – €5.000':    2500,
  '€5.000 – €20.000':   12500,
  '€20.000 – €83.000':  50000,
  'Más de €83.000':      83333,
}
const GASTOS_RANGO_VALOR = {
  '€0 o casi nada':      0,
  'Menos de €1.000':     500,
  '€1.000 – €5.000':    2500,
  '€5.000 – €20.000':   12500,
  'Más de €20.000':      20000,
}

export function AuthProvider({ children }) {
  const [user, setUser]                         = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [xp, setXp]                             = useState(0)
  const [condicion, setCondicion]               = useState(1)
  const [fullName, setFullName]                 = useState('')
  const [idioma, setIdioma]                     = useState('es')
  const [tipoNegocio, setTipoNegocio]           = useState(null)
  const [sector, setSector]                     = useState(null)
  const [bloqueo, setBloqueo]                   = useState(null)
  const [areaFoco, setAreaFoco]                 = useState(null)
  const [diagnosticoInicial, setDiagnosticoInicial] = useState(null)
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
          setDiagnosticoInicial(null)
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
        .select('xp, condicion, full_name, idioma, tipo_negocio, sector, bloqueo, area_foco, diagnostico_inicial')
        .eq('id', userId)
        .single()

      if (!data) return

      // El trigger de Supabase puebla full_name pero nunca sector/bloqueo/area_foco.
      // Si meta tiene sector y DB no → el usuario viene del wizard y aún no se guardó → usar metadata.
      const wizardPendiente = !!meta.sector && !data.sector

      const finalFullName         = data.full_name         || meta.full_name         || ''
      // meta.condicion es la condición asignada por el diagnóstico inicial (mínimo 3).
      // Nunca cargamos una condición menor a la del diagnóstico, aunque agregarXP la hubiera pisado.
      const condicionDiag  = meta.condicion ? Math.max(3, parseInt(meta.condicion) || 1) : 1
      const condicionDB    = data.condicion || 1
      const finalCondicion = wizardPendiente ? condicionDiag : Math.max(condicionDB, condicionDiag)
      const finalSector           = data.sector            || meta.sector            || null
      const finalBloqueo          = data.bloqueo           || meta.bloqueo           || null
      const finalAreaFoco         = data.area_foco         || meta.area_foco         || null
      const finalDiagnostico      = data.diagnostico_inicial || meta.diagnostico_inicial || null

      setXp(data.xp || 0)
      setCondicion(finalCondicion)
      setFullName(finalFullName)
      setIdioma(data.idioma || 'es')
      setTipoNegocio(data.tipo_negocio || null)
      setSector(finalSector)
      setBloqueo(finalBloqueo)
      setAreaFoco(finalAreaFoco)
      setDiagnosticoInicial(finalDiagnostico)

      // Guardar datos del wizard en DB (solo se ejecuta una vez)
      if (wizardPendiente) {
        await supabase.from('users').update({
          full_name:           meta.full_name    || data.full_name,
          condicion:           condicionDiag,
          sector:              meta.sector,
          bloqueo:             meta.bloqueo      || null,
          area_foco:           meta.area_foco    || null,
          tipo_negocio:        meta.tipo_negocio || null,
          diagnostico_inicial: meta.diagnostico_inicial || null,
        }).eq('id', userId)

        // Guardar ingresos/gastos declarados en el módulo de finanzas
        const diag = meta.diagnostico_inicial || {}
        const ingresoValor = INGRESOS_RANGO_VALOR[diag.ingresos_rango] ?? null
        const gastoValor   = GASTOS_RANGO_VALOR[diag.gastos_rango]    ?? null
        const hoy          = new Date().toISOString().split('T')[0]

        const txIniciales = []
        if (ingresoValor !== null && ingresoValor > 0) {
          txIniciales.push({ user_id: userId, tipo: 'ingreso', importe: ingresoValor, concepto: 'Declaración inicial · diagnóstico', categoria: 'diagnostico_inicial', fecha: hoy })
        }
        if (gastoValor !== null && gastoValor > 0) {
          txIniciales.push({ user_id: userId, tipo: 'gasto',   importe: gastoValor,   concepto: 'Declaración inicial · diagnóstico', categoria: 'diagnostico_inicial', fecha: hoy })
        }
        if (txIniciales.length > 0) {
          await supabase.from('transactions').insert(txIniciales)
        }
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }

  // ─── Agregar XP con validación económica ─────────────────────────
  const agregarXP = async (puntos, ingresosMes = null) => {
    if (!user) return
    const nuevoXP = (xp || 0) + puntos

    let condicionPorXP = 1
    if      (nuevoXP >= 10000) condicionPorXP = 6
    else if (nuevoXP >= 4000)  condicionPorXP = 5
    else if (nuevoXP >= 1500)  condicionPorXP = 4
    else if (nuevoXP >= 500)   condicionPorXP = 3
    else if (nuevoXP >= 100)   condicionPorXP = 2

    // Techo por ingresos: no se puede avanzar si los números no acompañan
    let techoPorIngresos = 6
    if (ingresosMes !== null) {
      if      (ingresosMes >= UMBRAL_INGRESOS[6]) techoPorIngresos = 6
      else if (ingresosMes >= UMBRAL_INGRESOS[5]) techoPorIngresos = 5
      else if (ingresosMes >= UMBRAL_INGRESOS[4]) techoPorIngresos = 4
      else if (ingresosMes >= UMBRAL_INGRESOS[3]) techoPorIngresos = 3
      else if (ingresosMes >  0)                  techoPorIngresos = 2
      else                                         techoPorIngresos = 1
    }

    const condicionPorAmbos    = Math.min(condicionPorXP, techoPorIngresos)
    const nuevaCondicion       = Math.max(condicion, condicionPorAmbos)
    const bloqueadoPorIngresos = ingresosMes !== null && condicionPorXP > nuevaCondicion

    supabase.from('users').update({ xp: nuevoXP, condicion: nuevaCondicion })
      .eq('id', user.id)
      .then(() => { setXp(nuevoXP); setCondicion(nuevaCondicion) })

    return { bloqueadoPorIngresos, condicionPorXP, techoPorIngresos, nuevaCondicion }
  }

  // ─── Auth ─────────────────────────────────────────────────────────
  const signUp = async (email, password, nombre, extraData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name:           nombre,
          sector:              extraData.sector              || null,
          condicion:           Math.max(3, extraData.condicion || 3),
          bloqueo:             extraData.bloqueo             || null,
          area_foco:           extraData.area_foco           || null,
          tipo_negocio:        extraData.tipo_negocio        || null,
          diagnostico_inicial: extraData.diagnostico_inicial || null,
        }
      }
    })
    if (error) throw error
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
    setDiagnosticoInicial(null)
  }

  const guardarTipoNegocio = async (tipo) => {
    if (!user) return
    await supabase.from('users').update({ tipo_negocio: tipo }).eq('id', user.id)
    setTipoNegocio(tipo)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      xp, condicion, fullName, idioma, tipoNegocio, sector, bloqueo, areaFoco, diagnosticoInicial,
      agregarXP, guardarTipoNegocio,
      signUp, signIn, signOut,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
