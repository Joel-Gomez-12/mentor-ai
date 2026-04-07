import { useState, useEffect, useRef } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CAMPOS = [
  { key: 'nombre',    label: 'Nombre',    placeholder: 'Ej: Juan García', icon: '👤' },
  { key: 'empresa',   label: 'Empresa',   placeholder: 'Ej: Acme S.L.',   icon: '🏢' },
  { key: 'telefono',  label: 'Teléfono',  placeholder: 'Ej: +34 600 000 000', icon: '📞' },
  { key: 'email',     label: 'Email',     placeholder: 'Ej: juan@acme.com',   icon: '✉️' },
  { key: 'direccion', label: 'Dirección', placeholder: 'Ej: Calle Mayor 1, Madrid', icon: '📍' },
  { key: 'notas',     label: 'Notas',     placeholder: 'Contexto, cómo lo conociste...', icon: '📝', multiline: true },
]

const FORM_VACIO = { nombre: '', empresa: '', telefono: '', email: '', direccion: '', notas: '' }

export default function Contactos({ onNavigate, currentPage }) {
  const { user, agregarXP } = useAuth()
  const fileRef   = useRef(null)
  const cameraRef = useRef(null)

  const [tab, setTab]               = useState('nuevo')
  const [imagen, setImagen]         = useState(null)      // { file, preview, base64, mime }
  const [form, setForm]             = useState(FORM_VACIO)
  const [extrayendo, setExtrayendo] = useState(false)
  const [guardando, setGuardando]   = useState(false)
  const [guardado, setGuardado]     = useState(false)
  const [error, setError]           = useState(null)
  const [contactos, setContactos]   = useState([])
  const [busqueda, setBusqueda]     = useState('')
  const [contactoAbierto, setContactoAbierto] = useState(null)

  useEffect(() => {
    if (user) cargarContactos()
  }, [user])

  const cargarContactos = async () => {
    const { data } = await supabase
      .from('contactos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setContactos(data)
  }

  // ─── Leer imagen seleccionada ─────────────────────────────────
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      // Separar base64 puro del prefijo data:image/...;base64,
      const base64 = dataUrl.split(',')[1]
      setImagen({ file, preview: dataUrl, base64, mime: file.type })
      setForm(FORM_VACIO)
      setGuardado(false)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  // ─── Extraer datos con Gemini Vision ─────────────────────────
  const extraerDatos = async () => {
    if (!imagen) return
    setExtrayendo(true)
    setError(null)

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: imagen.mime,
                  data: imagen.base64
                }
              },
              {
                text: `Analiza esta imagen de tarjeta de visita o tarjeta de contacto y extrae los datos de contacto.
Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin bloques de código.
Formato exacto:
{
  "nombre": "nombre completo de la persona",
  "empresa": "nombre de la empresa u organización",
  "telefono": "número de teléfono (puede haber varios separados por coma)",
  "email": "dirección de correo electrónico",
  "direccion": "dirección postal o ubicación",
  "notas": "cualquier otra información relevante como cargo, web, redes sociales"
}
Si algún campo no aparece en la tarjeta, déjalo como cadena vacía "".`
              }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
        })
      })

      if (!response.ok) throw new Error(`Error ${response.status}`)

      const data = await response.json()
      let texto = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      const match = texto.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No se pudo extraer información de la imagen')

      const parsed = JSON.parse(match[0])
      setForm({
        nombre:    parsed.nombre    || '',
        empresa:   parsed.empresa   || '',
        telefono:  parsed.telefono  || '',
        email:     parsed.email     || '',
        direccion: parsed.direccion || '',
        notas:     parsed.notas     || '',
      })
    } catch (err) {
      console.error('Error Gemini Vision:', err)
      setError('No se pudo leer la tarjeta. Puedes rellenar los datos manualmente.')
    } finally {
      setExtrayendo(false)
    }
  }

  // ─── Guardar contacto en Supabase ────────────────────────────
  const guardarContacto = async () => {
    if (!form.nombre && !form.empresa && !form.email && !form.telefono) {
      setError('Rellena al menos un campo antes de guardar.')
      return
    }
    setGuardando(true)
    setError(null)

    try {
      let imagen_url = null

      // Subir imagen a Storage si hay una
      if (imagen?.file) {
        const ext  = imagen.file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tarjetas')
          .upload(path, imagen.file, { contentType: imagen.mime, upsert: false })

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('tarjetas').getPublicUrl(uploadData.path)
          imagen_url = urlData.publicUrl
        }
      }

      const { error: saveError } = await supabase.from('contactos').insert({
        user_id:   user.id,
        nombre:    form.nombre    || null,
        empresa:   form.empresa   || null,
        telefono:  form.telefono  || null,
        email:     form.email     || null,
        direccion: form.direccion || null,
        notas:     form.notas     || null,
        imagen_url,
      })

      if (saveError) throw saveError

      setGuardado(true)
      setImagen(null)
      setForm(FORM_VACIO)
      await cargarContactos()
      await agregarXP(8)
    } catch (err) {
      console.error('Error guardando contacto:', err)
      setError('Error al guardar el contacto. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const contactosFiltrados = contactos.filter(c => {
    const q = busqueda.toLowerCase()
    return !q ||
      c.nombre?.toLowerCase().includes(q) ||
      c.empresa?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefono?.includes(q)
  })

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px',
    fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans, sans-serif'
  }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Tarjetas de contacto
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24 }}>
        Sube una foto de tarjeta de visita y la IA extrae los datos automáticamente.
      </p>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content' }}>
        {[
          { key: 'nuevo',     label: '➕ Nueva tarjeta' },
          { key: 'contactos', label: `📋 Mis contactos (${contactos.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm)', border: 'none',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: tab === t.key ? 600 : 400,
            background: tab === t.key ? 'var(--indigo)' : 'transparent',
            color: tab === t.key ? 'white' : 'var(--text-soft)',
            transition: 'all var(--transition)'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: NUEVA TARJETA
      ══════════════════════════════════════════════════════════ */}
      {tab === 'nuevo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

          {/* ── Panel izquierdo: imagen ── */}
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Foto de la tarjeta
            </p>

            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${imagen ? 'var(--indigo)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', padding: 24, textAlign: 'center',
                cursor: 'pointer', background: imagen ? 'var(--indigo-dim)' : 'var(--surface)',
                transition: 'all var(--transition)', minHeight: 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
              }}
            >
              {imagen ? (
                <img
                  src={imagen.preview}
                  alt="Tarjeta"
                  style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, objectFit: 'contain' }}
                />
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem' }}>📸</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-soft)' }}>
                    Arrastra una imagen o haz clic para seleccionar
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    JPG, PNG o WEBP
                  </div>
                </>
              )}
            </div>

            {/* Inputs ocultos */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            {/* Cámara nativa (móvil) */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />

            {/* Botones de acción zona imagen */}
            {!imagen && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                  🖼️ Galería
                </button>
                <button
                  onClick={() => cameraRef.current?.click()}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  📷 Cámara
                </button>
              </div>
            )}

            {imagen && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={extraerDatos}
                  disabled={extrayendo}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)',
                    background: extrayendo ? 'var(--surface3)' : 'var(--indigo)',
                    border: 'none', color: 'white', fontWeight: 600,
                    cursor: extrayendo ? 'not-allowed' : 'pointer', fontSize: '0.88rem'
                  }}>
                  {extrayendo ? '⏳ Extrayendo datos...' : '🤖 Extraer con IA'}
                </button>
                <button
                  onClick={() => { setImagen(null); setForm(FORM_VACIO); setError(null) }}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  🗑️
                </button>
              </div>
            )}
          </div>

          {/* ── Panel derecho: formulario ── */}
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Datos del contacto
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CAMPOS.map(campo => (
                <div key={campo.key}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: 5 }}>
                    {campo.icon} {campo.label}
                  </label>
                  {campo.multiline ? (
                    <textarea
                      value={form[campo.key]}
                      onChange={e => setForm(p => ({ ...p, [campo.key]: e.target.value }))}
                      placeholder={campo.placeholder}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[campo.key]}
                      onChange={e => setForm(p => ({ ...p, [campo.key]: e.target.value }))}
                      placeholder={campo.placeholder}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginTop: 14, fontSize: '0.83rem', color: 'var(--leo)' }}>
                ⚠️ {error}
              </div>
            )}

            {guardado && (
              <div style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginTop: 14, fontSize: '0.83rem', color: '#27AE60' }}>
                ✅ Contacto guardado correctamente.
              </div>
            )}

            <button
              onClick={guardarContacto}
              disabled={guardando}
              style={{
                width: '100%', marginTop: 16, padding: '11px 0',
                borderRadius: 'var(--radius-sm)', border: 'none',
                background: guardando ? 'var(--surface3)' : 'var(--indigo)',
                color: 'white', fontWeight: 600, fontSize: '0.9rem',
                cursor: guardando ? 'not-allowed' : 'pointer',
                opacity: guardando ? 0.7 : 1
              }}>
              {guardando ? '⏳ Guardando...' : '💾 Guardar contacto'}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
              Puedes rellenar o corregir los datos manualmente antes de guardar.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: MIS CONTACTOS
      ══════════════════════════════════════════════════════════ */}
      {tab === 'contactos' && (
        <div>
          {/* Buscador */}
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por nombre, empresa, email o teléfono..."
            style={{
              ...inputStyle,
              marginBottom: 20, fontSize: '0.9rem',
              padding: '12px 16px'
            }}
          />

          {contactosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📇</div>
              <div style={{ fontSize: '0.9rem' }}>
                {busqueda ? 'No hay contactos que coincidan con la búsqueda.' : 'Aún no tienes contactos guardados.'}
              </div>
              {!busqueda && (
                <button onClick={() => setTab('nuevo')} style={{ marginTop: 16, padding: '9px 22px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  ➕ Añadir primer contacto
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {contactosFiltrados.map(c => {
                const abierto = contactoAbierto === c.id
                return (
                  <div key={c.id} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                    transition: 'all var(--transition)'
                  }}>
                    {/* Header tarjeta */}
                    <button
                      onClick={() => setContactoAbierto(abierto ? null : c.id)}
                      style={{
                        width: '100%', padding: '16px 18px', background: 'none',
                        border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12
                      }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--indigo-dim)', border: '2px solid rgba(99,102,241,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--indigo)'
                      }}>
                        {c.nombre ? c.nombre.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.nombre || 'Sin nombre'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.empresa || c.email || c.telefono || '—'}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>{abierto ? '▲' : '▼'}</span>
                    </button>

                    {/* Detalle expandible */}
                    {abierto && (
                      <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
                        {c.imagen_url && (
                          <img
                            src={c.imagen_url}
                            alt="Tarjeta"
                            style={{ width: '100%', borderRadius: 8, marginTop: 14, marginBottom: 14, objectFit: 'contain', maxHeight: 140 }}
                          />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: c.imagen_url ? 0 : 14 }}>
                          {[
                            { icon: '🏢', val: c.empresa },
                            { icon: '📞', val: c.telefono },
                            { icon: '✉️', val: c.email },
                            { icon: '📍', val: c.direccion },
                            { icon: '📝', val: c.notas },
                          ].filter(f => f.val).map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
                              <span style={{ flexShrink: 0 }}>{f.icon}</span>
                              <span style={{ lineHeight: 1.5 }}>{f.val}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 12 }}>
                          Añadido el {new Date(c.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
