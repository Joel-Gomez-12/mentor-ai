import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIAS_GAS = ['Personal', 'Marketing', 'Operaciones', 'Software', 'Otros']

export default function Finanzas({ onNavigate, currentPage, tab: tabInicial = 'ingreso' }) {
  const { user, agregarXP } = useAuth()
  const [tab, setTab] = useState(tabInicial)
  const [transacciones, setTransacciones] = useState([])
  const [proyectos, setProyectos] = useState(['General'])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [formIng, setFormIng] = useState({
    cantidad: '', concepto: '', proyecto: 'General',
    cliente: '', fecha: new Date().toISOString().split('T')[0]
  })
  const [formGas, setFormGas] = useState({
    cantidad: '', concepto: '', categoria: '',
    fecha: new Date().toISOString().split('T')[0]
  })

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 14px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans, sans-serif'
  }
  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 500,
    color: 'var(--text-soft)', marginBottom: 6
  }

  // ─── Cargar datos al montar ──────────────────────────────────────────
  useEffect(() => {
    if (user) {
      cargarTransacciones()
      cargarProyectos()
    }
  }, [user])

  const cargarTransacciones = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: false })
    if (!error) setTransacciones(data || [])
    setLoading(false)
  }

  const cargarProyectos = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, nombre')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setProyectos(['General', ...data.map(p => p.nombre)])
    }
  }

  // ─── Filtrar por tipo ────────────────────────────────────────────────
  const ingresos = transacciones.filter(t => t.tipo === 'ingreso')
  const gastos   = transacciones.filter(t => t.tipo === 'gasto')

  // ─── Totales ─────────────────────────────────────────────────────────
  const totalIng = ingresos.reduce((s, t) => s + parseFloat(t.importe || 0), 0)
  const totalGas = gastos.reduce((s, t)   => s + parseFloat(t.importe || 0), 0)
  const balance  = totalIng - totalGas

  // ─── Guardar ingreso ─────────────────────────────────────────────────
  const guardarIngreso = async () => {
    if (!formIng.cantidad || !formIng.concepto) return
    setGuardando(true)
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id:   user.id,
        tipo:      'ingreso',
        importe:   parseFloat(formIng.cantidad),
        concepto:  formIng.concepto,
        categoria: formIng.proyecto,
        proyecto:  formIng.proyecto,
        cliente:   formIng.cliente,
        fecha:     formIng.fecha,
      })
      .select()
      .single()

    if (!error && data) {
      setTransacciones(prev => [data, ...prev])
      setFormIng({
        cantidad: '', concepto: '', proyecto: 'General',
        cliente: '', fecha: new Date().toISOString().split('T')[0]
      })
      await agregarXP(15)
    }
    setGuardando(false)
  }

  // ─── Guardar gasto ───────────────────────────────────────────────────
  const guardarGasto = async () => {
    if (!formGas.cantidad || !formGas.concepto) return
    setGuardando(true)
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id:   user.id,
        tipo:      'gasto',
        importe:   parseFloat(formGas.cantidad),
        concepto:  formGas.concepto,
        categoria: formGas.categoria,
        fecha:     formGas.fecha,
      })
      .select()
      .single()

    if (!error && data) {
      setTransacciones(prev => [data, ...prev])
      setFormGas({
        cantidad: '', concepto: '', categoria: '',
        fecha: new Date().toISOString().split('T')[0]
      })
      await agregarXP(10)
    }
    setGuardando(false)
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Finanzas
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24 }}>
        Registra y visualiza tu flujo de caja.
      </p>

      {/* ── Resumen top ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Ingresos este mes', value: `€${totalIng.toFixed(2)}`, sub: `${ingresos.length} registros`,        color: 'var(--jedi)', border: 'var(--jedi)' },
          { label: 'Gastos este mes',   value: `€${totalGas.toFixed(2)}`, sub: `${gastos.length} registros`,          color: 'var(--leo)',  border: 'var(--leo)' },
          { label: 'Balance neto',      value: `€${balance.toFixed(2)}`,  sub: balance >= 0 ? '¡Positivo! Buen trabajo.' : 'Revisa tus gastos.', color: balance >= 0 ? 'var(--gold)' : 'var(--leo)', border: 'var(--gold)' },
        ].map(({ label, value, sub, color, border }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${border}`, borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          ['ingreso',  '📈 Registrar ingreso'],
          ['gasto',    '📉 Registrar gasto'],
          ['historial','📋 Historial'],
        ].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem', cursor: 'pointer',
              fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'var(--indigo-dim)' : 'var(--surface2)',
              border: `1px solid ${tab === t ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
              color: tab === t ? 'var(--indigo)' : 'var(--text-soft)'
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── REGISTRAR INGRESO ────────────────────────────────────────── */}
      {tab === 'ingreso' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cantidad (€) *</label>
              <input type="number" value={formIng.cantidad}
                onChange={e => setFormIng(p => ({ ...p, cantidad: e.target.value }))}
                placeholder="0.00" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Concepto *</label>
              <input type="text" value={formIng.concepto}
                onChange={e => setFormIng(p => ({ ...p, concepto: e.target.value }))}
                placeholder="Ej: Consultoría estratégica" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Proyecto</label>
              <select value={formIng.proyecto}
                onChange={e => setFormIng(p => ({ ...p, proyecto: e.target.value }))}
                style={inputStyle}>
                {proyectos.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cliente</label>
              <input type="text" value={formIng.cliente}
                onChange={e => setFormIng(p => ({ ...p, cliente: e.target.value }))}
                placeholder="Nombre del cliente" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={formIng.fecha}
                onChange={e => setFormIng(p => ({ ...p, fecha: e.target.value }))}
                style={inputStyle} />
            </div>
            <button onClick={guardarIngreso} disabled={guardando}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.88rem', opacity: guardando ? 0.7 : 1 }}>
              {guardando ? 'Guardando...' : '📈 Guardar ingreso'}
            </button>
          </div>

          {/* Lista ingresos */}
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Ingresos registrados
            </p>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</p>
            ) : ingresos.length > 0 ? (
              <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--jedi)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total acumulado</div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--jedi)' }}>
                    €{totalIng.toFixed(2)}
                  </div>
                </div>
                {ingresos.map(r => (
                  <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{r.concepto}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {r.proyecto || '—'} · {r.cliente || '—'} · {r.fecha}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--jedi)', flexShrink: 0 }}>
                      +€{parseFloat(r.importe).toFixed(2)}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Todavía no has registrado ningún ingreso.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── REGISTRAR GASTO ──────────────────────────────────────────── */}
      {tab === 'gasto' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cantidad (€) *</label>
              <input type="number" value={formGas.cantidad}
                onChange={e => setFormGas(p => ({ ...p, cantidad: e.target.value }))}
                placeholder="0.00" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Concepto *</label>
              <input type="text" value={formGas.concepto}
                onChange={e => setFormGas(p => ({ ...p, concepto: e.target.value }))}
                placeholder="Ej: Suscripción herramienta" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Categoría</label>
              <select value={formGas.categoria}
                onChange={e => setFormGas(p => ({ ...p, categoria: e.target.value }))}
                style={inputStyle}>
                <option value="">Selecciona categoría</option>
                {CATEGORIAS_GAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={formGas.fecha}
                onChange={e => setFormGas(p => ({ ...p, fecha: e.target.value }))}
                style={inputStyle} />
            </div>
            <button onClick={guardarGasto} disabled={guardando}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--leo)', color: '#1a0000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.88rem', opacity: guardando ? 0.7 : 1 }}>
              {guardando ? 'Guardando...' : '📉 Guardar gasto'}
            </button>
          </div>

          {/* Lista gastos */}
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              Gastos registrados
            </p>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</p>
            ) : gastos.length > 0 ? (
              <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--leo)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total acumulado</div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--leo)' }}>
                    €{totalGas.toFixed(2)}
                  </div>
                </div>
                {gastos.map(r => (
                  <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{r.concepto}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {r.categoria || '—'} · {r.fecha}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--leo)', flexShrink: 0 }}>
                      -€{parseFloat(r.importe).toFixed(2)}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Todavía no has registrado ningún gasto.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORIAL ────────────────────────────────────────────────── */}
      {tab === 'historial' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</p>
          ) : transacciones.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>💰</div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, marginBottom: 8 }}>Sin movimientos aún</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Registra tu primer ingreso o gasto para verlo aquí.
              </p>
            </div>
          ) : (
            transacciones.map(r => (
              <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>{r.tipo === 'ingreso' ? '📈' : '📉'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{r.concepto}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {r.tipo === 'ingreso'
                        ? `${r.proyecto || '—'} · ${r.cliente || '—'}`
                        : r.categoria || '—'
                      } · {r.fecha}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, flexShrink: 0, color: r.tipo === 'ingreso' ? 'var(--jedi)' : 'var(--leo)' }}>
                  {r.tipo === 'ingreso' ? '+' : '-'}€{parseFloat(r.importe).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  )
}