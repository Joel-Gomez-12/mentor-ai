import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CONDICIONES_NAMES = ['', 'Inexistencia', 'Nacimiento', 'Supervivencia', 'Estabilidad', 'Expansión', 'Dominio']
const CONDICIONES_COLORS = ['', '#6B7280', '#16A34A', '#C0392B', '#F39C12', '#3498DB', '#27AE60']

const MENTORES = [
  { key: 'jedi',  icon: '🧙', label: 'Jedi',     color: 'var(--jedi)'  },
  { key: 'steve', icon: '💡', label: 'Steve',    color: 'var(--steve)' },
  { key: 'leo',   icon: '⚔️', label: 'Leonidas',  color: 'var(--leo)'   },
]

export default function Ajustes({ onNavigate, currentPage }) {
  const { user, signOut, xp, condicion } = useAuth()

  // ── Perfil ────────────────────────────────────────────────────
  const [fullName,   setFullName]   = useState('')
  const [sector,     setSector]     = useState('')
  const [moneda,     setMoneda]     = useState('EUR')
  const [mentorFav,  setMentorFav]  = useState('jedi')
  const [guardando,  setGuardando]  = useState(false)
  const [savedOk,    setSavedOk]    = useState(false)

  // ── Contraseña ────────────────────────────────────────────────
  const [passActual,  setPassActual]  = useState('')
  const [passNueva,   setPassNueva]   = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [passMsg,     setPassMsg]     = useState(null)  // { ok, text }
  const [cambiandoPass, setCambiandoPass] = useState(false)

  // ── Zona de peligro ───────────────────────────────────────────
  const [confirmando, setConfirmando] = useState(null)  // 'pensamientos' | 'transacciones' | 'reset'
  const [borrando,    setBorrando]    = useState(false)
  const [borradoOk,   setBorradoOk]   = useState(null)

  // ── Cargar datos ──────────────────────────────────────────────
  useEffect(() => {
    if (user) cargarPerfil()
  }, [user])

  const cargarPerfil = async () => {
    const { data } = await supabase
      .from('users')
      .select('full_name, sector, moneda, mentor_fav')
      .eq('id', user.id)
      .single()
    if (data) {
      setFullName(data.full_name || '')
      setSector(data.sector    || '')
      setMoneda(data.moneda    || 'EUR')
      setMentorFav(data.mentor_fav || 'jedi')
    }
  }

  // ── Guardar perfil ─────────────────────────────────────────────
  const guardarPerfil = async () => {
    setGuardando(true)
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName, sector, moneda, mentor_fav: mentorFav })
      .eq('id', user.id)
    setGuardando(false)
    if (!error) {
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2500)
    }
  }

  // ── Cambiar contraseña ─────────────────────────────────────────
  const cambiarPassword = async () => {
    setPassMsg(null)
    if (!passNueva || passNueva.length < 6) {
      setPassMsg({ ok: false, text: 'La nueva contraseña debe tener al menos 6 caracteres.' })
      return
    }
    if (passNueva !== passConfirm) {
      setPassMsg({ ok: false, text: 'Las contraseñas no coinciden.' })
      return
    }
    setCambiandoPass(true)
    const { error } = await supabase.auth.updateUser({ password: passNueva })
    setCambiandoPass(false)
    if (error) {
      setPassMsg({ ok: false, text: error.message })
    } else {
      setPassMsg({ ok: true, text: 'Contraseña actualizada correctamente.' })
      setPassActual(''); setPassNueva(''); setPassConfirm('')
      setTimeout(() => setPassMsg(null), 3000)
    }
  }

  // ── Borrar datos ───────────────────────────────────────────────
  const ejecutarBorrado = async () => {
    if (!confirmando) return
    setBorrando(true)

    if (confirmando === 'pensamientos') {
      await supabase.from('pensamientos').delete().eq('user_id', user.id)
      setBorradoOk('Pensamientos eliminados.')
    } else if (confirmando === 'transacciones') {
      await supabase.from('transactions').delete().eq('user_id', user.id)
      setBorradoOk('Transacciones eliminadas.')
    } else if (confirmando === 'reset') {
      await Promise.all([
        supabase.from('pensamientos').delete().eq('user_id', user.id),
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('projects').delete().eq('user_id', user.id),
        supabase.from('sessions').delete().eq('user_id', user.id),
        supabase.from('pulsos').delete().eq('user_id', user.id),
        supabase.from('sisi_sesiones').delete().eq('user_id', user.id),
        supabase.from('contactos').delete().eq('user_id', user.id),
        supabase.from('formacion_progreso').delete().eq('user_id', user.id),
        supabase.from('users').update({ xp: 0, condicion: 1 }).eq('id', user.id),
      ])
      setBorradoOk('Reset total completado. Recarga la app.')
    }

    setBorrando(false)
    setConfirmando(null)
    setTimeout(() => setBorradoOk(null), 4000)
  }

  // ── Estilos comunes ────────────────────────────────────────────
  const card   = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }
  const input  = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }
  const label  = { display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: 6 }
  const sTitle = { fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }

  const condIdx   = Math.min((condicion || 1) - 1, 5)
  const condColor = CONDICIONES_COLORS[condicion] || '#6B7280'

  const monedaSimbolo = { EUR: '€', USD: '$', HNL: 'L', GBP: '£', COP: '$', MXN: '$' }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Ajustes
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 28 }}>
        Gestiona tu cuenta y preferencias de Mentor AI.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── COLUMNA IZQUIERDA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Cuenta */}
          <div style={card}>
            <p style={sTitle}>Tu cuenta</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--indigo-dim)', border: '2px solid var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {fullName ? fullName[0].toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{fullName || 'Sin nombre'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
            </div>

            {/* Fase actual (solo lectura) */}
            <div style={{ background: 'var(--surface2)', border: `1px solid ${condColor}44`, borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fase actual</div>
                <div style={{ fontWeight: 700, color: condColor, fontSize: '0.9rem' }}>
                  Fase {condicion} — {CONDICIONES_NAMES[condicion] || ''}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{xp || 0} XP</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Nombre completo</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre" style={input} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Tu sector / industria</label>
              <input value={sector} onChange={e => setSector(e.target.value)} placeholder="Ej: Tecnología, Salud, Educación..." style={input} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={label}>Moneda</label>
              <select value={moneda} onChange={e => setMoneda(e.target.value)} style={input}>
                <option value="EUR">€ Euro</option>
                <option value="USD">$ Dólar (USD)</option>
                <option value="HNL">L Lempira (Honduras)</option>
                <option value="GBP">£ Libra esterlina</option>
                <option value="COP">$ Peso colombiano</option>
                <option value="MXN">$ Peso mexicano</option>
              </select>
            </div>

            <button
              onClick={guardarPerfil}
              disabled={guardando}
              style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)', background: savedOk ? '#16A34A' : 'var(--indigo)', border: 'none', color: 'white', fontWeight: 600, cursor: guardando ? 'not-allowed' : 'pointer', fontSize: '0.88rem', opacity: guardando ? 0.7 : 1, transition: 'all 0.3s' }}>
              {guardando ? '⏳ Guardando...' : savedOk ? '✅ Guardado correctamente' : '💾 Guardar cambios'}
            </button>
          </div>

          {/* Mentor favorito */}
          <div style={card}>
            <p style={sTitle}>Mentor favorito</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              SISI lo tendrá en cuenta al sugerirte apoyo secundario.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MENTORES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMentorFav(m.key)}
                  style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: mentorFav === m.key ? `${m.color}15` : 'var(--surface2)',
                    border: `1px solid ${mentorFav === m.key ? m.color : 'var(--border2)'}`,
                    color: mentorFav === m.key ? m.color : 'var(--text-soft)',
                    fontWeight: mentorFav === m.key ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                    textAlign: 'left',
                  }}>
                  <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                  <span style={{ fontSize: '0.88rem' }}>{m.label}</span>
                  {mentorFav === m.key && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✓ Seleccionado</span>}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 12 }}>
              * Se guarda junto con tu perfil al pulsar "Guardar cambios"
            </p>
          </div>
        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Cambiar contraseña */}
          <div style={card}>
            <p style={sTitle}>Cambiar contraseña</p>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Nueva contraseña</label>
              <input type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} placeholder="Mínimo 6 caracteres" style={input} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Confirmar nueva contraseña</label>
              <input type="password" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} placeholder="Repite la nueva contraseña" style={input} />
            </div>

            {passMsg && (
              <div style={{ background: passMsg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${passMsg.ok ? '#22C55E' : '#EF4444'}`, borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, fontSize: '0.83rem', color: passMsg.ok ? '#22C55E' : '#EF4444' }}>
                {passMsg.ok ? '✅' : '⚠️'} {passMsg.text}
              </div>
            )}

            <button
              onClick={cambiarPassword}
              disabled={cambiandoPass || !passNueva || !passConfirm}
              style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', fontWeight: 600, cursor: cambiandoPass || !passNueva ? 'not-allowed' : 'pointer', fontSize: '0.88rem', opacity: cambiandoPass || !passNueva ? 0.6 : 1, transition: 'all 0.2s' }}>
              {cambiandoPass ? '⏳ Actualizando...' : '🔑 Actualizar contraseña'}
            </button>
          </div>

          {/* Zona de peligro */}
          <div style={{ ...card, border: '1px solid rgba(239,68,68,0.25)' }}>
            <p style={{ ...sTitle, color: '#EF4444' }}>Zona de peligro</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18 }}>
              Estas acciones son permanentes y no se pueden deshacer.
            </p>

            {borradoOk && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #22C55E', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, fontSize: '0.83rem', color: '#22C55E' }}>
                ✅ {borradoOk}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'pensamientos',  label: '🗑️ Borrar pensamientos',   desc: 'Elimina todos tus pensamientos capturados' },
                { key: 'transacciones', label: '🗑️ Borrar transacciones',   desc: 'Elimina todos tus ingresos y gastos' },
              ].map(({ key, label: lbl, desc }) => (
                <div key={key}>
                  {confirmando === key ? (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                      <p style={{ fontSize: '0.82rem', color: '#EF4444', marginBottom: 10, fontWeight: 600 }}>
                        ¿Confirmas que quieres {lbl.replace('🗑️ ', '').toLowerCase()}?
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={ejecutarBorrado} disabled={borrando} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', background: '#EF4444', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                          {borrando ? 'Borrando...' : 'Sí, borrar'}
                        </button>
                        <button onClick={() => setConfirmando(null)} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmando(key)} style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: '0.84rem', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 600 }}>{lbl}</span>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{desc}</span>
                    </button>
                  )}
                </div>
              ))}

              {/* Reset total */}
              {confirmando === 'reset' ? (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#EF4444', marginBottom: 6, fontWeight: 700 }}>
                    ⚠️ ¿Confirmas el reset total?
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Se borrarán todos tus datos: pensamientos, transacciones, proyectos, sesiones con mentores, pulsos, historial de SISI, contactos y formación. Tu XP vuelve a 0.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={ejecutarBorrado} disabled={borrando} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: '#EF4444', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                      {borrando ? 'Reseteando...' : '🔴 Sí, reset total'}
                    </button>
                    <button onClick={() => setConfirmando(null)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmando('reset')} style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.84rem', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 700 }}>🔴 Reset total</span>
                  <span style={{ fontSize: '0.73rem', opacity: 0.75 }}>Borra todos tus datos y reinicia desde cero</span>
                </button>
              )}
            </div>
          </div>

          {/* Cerrar sesión + versión */}
          <div style={card}>
            <button
              onClick={signOut}
              style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', marginBottom: 16 }}>
              🚪 Cerrar sesión
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Mentor AI · MVP v1.0 · Datos en Supabase
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
