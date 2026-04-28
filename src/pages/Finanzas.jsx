import { useState, useEffect, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CATEGORIAS_GAS = ['Personal', 'Marketing', 'Operaciones', 'Software', 'Otros']

const COLORS_PIE = ['#C0392B', '#E67E22', '#F39C12', '#8E44AD', '#2980B9', '#16A085']

// ─── Tooltip personalizado ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '€' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0C1C38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Finanzas({ onNavigate, currentPage, tab: tabInicial = 'ingreso' }) {
  const { user, agregarXP } = useAuth()
  const [tab, setTab]               = useState(tabInicial)
  const [transacciones, setTx]      = useState([])
  const [proyectos, setProyectos]   = useState(['General'])
  const [loading, setLoading]       = useState(true)
  const [guardando, setGuardando]   = useState(false)
  const [periodo, setPeriodo]       = useState(6)

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

  useEffect(() => {
    if (user) { cargarTransacciones(); cargarProyectos() }
  }, [user])

  const cargarTransacciones = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions').select('*').eq('user_id', user.id)
      .order('fecha', { ascending: false })
    if (!error) setTx(data || [])
    setLoading(false)
  }

  const cargarProyectos = async () => {
    const { data } = await supabase.from('projects').select('id, nombre')
      .eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setProyectos(['General', ...data.map(p => p.nombre)])
  }

  const ingresos = transacciones.filter(t => t.tipo === 'ingreso')
  const gastos   = transacciones.filter(t => t.tipo === 'gasto')
  const totalIng = ingresos.reduce((s, t) => s + parseFloat(t.importe || 0), 0)
  const totalGas = gastos.reduce((s, t)   => s + parseFloat(t.importe || 0), 0)
  const balance  = totalIng - totalGas

  // ─── Datos del mes actual ──────────────────────────────────────────────
  const ahora     = new Date()
  const mesKey    = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`
  const ingMes    = ingresos.filter(t => t.fecha?.startsWith(mesKey))
  const gasMes    = gastos.filter(t => t.fecha?.startsWith(mesKey))
  const totalIngMes = ingMes.reduce((s, t) => s + parseFloat(t.importe || 0), 0)
  const totalGasMes = gasMes.reduce((s, t) => s + parseFloat(t.importe || 0), 0)

  // ─── Datos calculados para gráficos ───────────────────────────────────
  const { mesesData, kpis, gastosCat, cashflow } = useMemo(() => {
    // Generar array de meses según período
    const meses = []
    for (let i = periodo - 1; i >= 0; i--) {
      const d   = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      meses.push({
        key,
        label: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        Ingresos: 0, Gastos: 0,
      })
    }

    transacciones.forEach(t => {
      const key = t.fecha?.substring(0, 7)
      const m   = meses.find(m => m.key === key)
      if (!m) return
      if (t.tipo === 'ingreso') m.Ingresos += parseFloat(t.importe || 0)
      else                      m.Gastos   += parseFloat(t.importe || 0)
    })

    // Cash flow acumulado
    let acum = 0
    const cashflow = meses.map(m => {
      acum += m.Ingresos - m.Gastos
      return { label: m.label, 'Cash flow': parseFloat(acum.toFixed(2)) }
    })

    // KPIs
    const margen    = totalIngMes > 0 ? ((totalIngMes - totalGasMes) / totalIngMes * 100) : 0
    const last3Gas  = meses.slice(-3).reduce((s, m) => s + m.Gastos, 0) / 3
    const runway    = last3Gas > 0 ? Math.floor(balance / last3Gas) : null
    const clientes  = new Set(ingMes.map(t => t.cliente).filter(Boolean)).size
    const ingCliente = clientes > 0 ? totalIngMes / clientes : totalIngMes

    // Gastos por categoría
    const catMap = {}
    gastos.filter(t => t.fecha?.startsWith(mesKey)).forEach(t => {
      const cat = t.categoria || 'Otros'
      catMap[cat] = (catMap[cat] || 0) + parseFloat(t.importe || 0)
    })
    const gastosCat = Object.entries(catMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)

    return {
      mesesData: meses.map(m => ({
        label: m.label,
        Ingresos: parseFloat(m.Ingresos.toFixed(2)),
        Gastos:   parseFloat(m.Gastos.toFixed(2)),
      })),
      kpis: { margen, burnRate: last3Gas, runway, ingCliente },
      gastosCat,
      cashflow,
    }
  }, [transacciones, periodo])

  // ─── Guardar ingreso ──────────────────────────────────────────────────
  const guardarIngreso = async () => {
    if (!formIng.cantidad || !formIng.concepto) return
    setGuardando(true)
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id, tipo: 'ingreso',
      importe: parseFloat(formIng.cantidad),
      concepto: formIng.concepto, categoria: formIng.proyecto,
      proyecto: formIng.proyecto, cliente: formIng.cliente, fecha: formIng.fecha,
    }).select().single()

    if (!error && data) {
      setTx(prev => [data, ...prev])
      setFormIng({ cantidad: '', concepto: '', proyecto: 'General', cliente: '', fecha: new Date().toISOString().split('T')[0] })
      const { count } = await supabase.from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('tipo', 'ingreso')
      await agregarXP(count === 1 ? 10 : 5)
    }
    setGuardando(false)
  }

  // ─── Guardar gasto ────────────────────────────────────────────────────
  const guardarGasto = async () => {
    if (!formGas.cantidad || !formGas.concepto) return
    setGuardando(true)
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id, tipo: 'gasto',
      importe: parseFloat(formGas.cantidad),
      concepto: formGas.concepto, categoria: formGas.categoria, fecha: formGas.fecha,
    }).select().single()

    if (!error && data) {
      setTx(prev => [data, ...prev])
      setFormGas({ cantidad: '', concepto: '', categoria: '', fecha: new Date().toISOString().split('T')[0] })
      await agregarXP(2)
    }
    setGuardando(false)
  }

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }

  return (
    <Layout currentPage={currentPage} onNavigate={onNavigate}>
      <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
        Finanzas
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 24 }}>
        Registra y visualiza tu flujo de caja.
      </p>

      {/* ── Resumen top ─────────────────────────────────────────────── */}
      <div className="rg-3" style={{ gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Ingresos totales', value: `€${totalIng.toFixed(2)}`, sub: `${ingresos.length} registros`, color: 'var(--jedi)', border: 'var(--jedi)' },
          { label: 'Gastos totales',   value: `€${totalGas.toFixed(2)}`, sub: `${gastos.length} registros`,  color: 'var(--leo)',  border: 'var(--leo)' },
          { label: 'Balance neto',     value: `€${balance.toFixed(2)}`,  sub: balance >= 0 ? '✓ Positivo' : '⚠ Revisa tus gastos', color: balance >= 0 ? 'var(--gold)' : 'var(--leo)', border: 'var(--gold)' },
        ].map(({ label, value, sub, color, border }) => (
          <div key={label} style={{ ...cardStyle, borderLeft: `3px solid ${border}` }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.6rem', color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="tabs-scroll" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          ['ingreso',   '📈 Registrar ingreso'],
          ['gasto',     '📉 Registrar gasto'],
          ['historial', '📋 Historial'],
          ['evolucion', '📊 Dashboard'],
        ].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem', cursor: 'pointer',
            fontWeight: tab === t ? 600 : 400,
            background: tab === t ? 'var(--indigo-dim)' : 'var(--surface2)',
            border: `1px solid ${tab === t ? 'rgba(18,140,126,0.25)' : 'var(--border)'}`,
            color: tab === t ? 'var(--indigo)' : 'var(--text-soft)'
          }}>{label}</button>
        ))}
      </div>

      {/* ── REGISTRAR INGRESO ────────────────────────────────────────── */}
      {tab === 'ingreso' && (
        <div className="rg-2" style={{ gap: 20, alignItems: 'start' }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cantidad (€) *</label>
              <input type="number" value={formIng.cantidad} onChange={e => setFormIng(p => ({ ...p, cantidad: e.target.value }))} placeholder="0.00" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Concepto *</label>
              <input type="text" value={formIng.concepto} onChange={e => setFormIng(p => ({ ...p, concepto: e.target.value }))} placeholder="Ej: Consultoría estratégica" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Proyecto</label>
              <select value={formIng.proyecto} onChange={e => setFormIng(p => ({ ...p, proyecto: e.target.value }))} style={inputStyle}>
                {proyectos.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cliente</label>
              <input type="text" value={formIng.cliente} onChange={e => setFormIng(p => ({ ...p, cliente: e.target.value }))} placeholder="Nombre del cliente" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={formIng.fecha} onChange={e => setFormIng(p => ({ ...p, fecha: e.target.value }))} style={inputStyle} />
            </div>
            <button onClick={guardarIngreso} disabled={guardando} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--indigo)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.88rem', opacity: guardando ? 0.7 : 1 }}>
              {guardando ? 'Guardando...' : '📈 Guardar ingreso'}
            </button>
          </div>
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Ingresos registrados</p>
            {ingresos.length > 0 ? (
              <>
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--jedi)', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total acumulado</div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--jedi)' }}>€{totalIng.toFixed(2)}</div>
                </div>
                {ingresos.map(r => (
                  <div key={r.id} style={{ ...cardStyle, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{r.concepto}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.proyecto || '—'} · {r.cliente || '—'} · {r.fecha}</div>
                    </div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--jedi)', flexShrink: 0 }}>+€{parseFloat(r.importe).toFixed(2)}</div>
                  </div>
                ))}
              </>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Todavía no has registrado ningún ingreso.</p>}
          </div>
        </div>
      )}

      {/* ── REGISTRAR GASTO ──────────────────────────────────────────── */}
      {tab === 'gasto' && (
        <div className="rg-2" style={{ gap: 20, alignItems: 'start' }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Cantidad (€) *</label>
              <input type="number" value={formGas.cantidad} onChange={e => setFormGas(p => ({ ...p, cantidad: e.target.value }))} placeholder="0.00" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Concepto *</label>
              <input type="text" value={formGas.concepto} onChange={e => setFormGas(p => ({ ...p, concepto: e.target.value }))} placeholder="Ej: Suscripción herramienta" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Categoría</label>
              <select value={formGas.categoria} onChange={e => setFormGas(p => ({ ...p, categoria: e.target.value }))} style={inputStyle}>
                <option value="">Selecciona categoría</option>
                {CATEGORIAS_GAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={formGas.fecha} onChange={e => setFormGas(p => ({ ...p, fecha: e.target.value }))} style={inputStyle} />
            </div>
            <button onClick={guardarGasto} disabled={guardando} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--leo)', color: '#1a0000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.88rem', opacity: guardando ? 0.7 : 1 }}>
              {guardando ? 'Guardando...' : '📉 Guardar gasto'}
            </button>
          </div>
          <div>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Gastos registrados</p>
            {gastos.length > 0 ? (
              <>
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--leo)', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total acumulado</div>
                  <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--leo)' }}>€{totalGas.toFixed(2)}</div>
                </div>
                {gastos.map(r => (
                  <div key={r.id} style={{ ...cardStyle, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{r.concepto}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.categoria || '—'} · {r.fecha}</div>
                    </div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--leo)', flexShrink: 0 }}>-€{parseFloat(r.importe).toFixed(2)}</div>
                  </div>
                ))}
              </>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Todavía no has registrado ningún gasto.</p>}
          </div>
        </div>
      )}

      {/* ── HISTORIAL ────────────────────────────────────────────────── */}
      {tab === 'historial' && (
        <div>
          {loading ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</p>
          : transacciones.length === 0 ? (
            <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>💰</div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, marginBottom: 8 }}>Sin movimientos aún</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registra tu primer ingreso o gasto para verlo aquí.</p>
            </div>
          ) : transacciones.map(r => (
            <div key={r.id} style={{ ...cardStyle, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.2rem' }}>{r.tipo === 'ingreso' ? '📈' : '📉'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{r.concepto}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {r.tipo === 'ingreso' ? `${r.proyecto || '—'} · ${r.cliente || '—'}` : r.categoria || '—'} · {r.fecha}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, flexShrink: 0, color: r.tipo === 'ingreso' ? 'var(--jedi)' : 'var(--leo)' }}>
                {r.tipo === 'ingreso' ? '+' : '-'}€{parseFloat(r.importe).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DASHBOARD ────────────────────────────────────────────────── */}
      {tab === 'evolucion' && (
        <div>
          {/* Header con filtro */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Visualiza la salud financiera de tu negocio</p>
            <select
              value={periodo}
              onChange={e => setPeriodo(Number(e.target.value))}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '7px 14px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </div>

          {/* 6 KPI Cards */}
          <div className="rg-3" style={{ gap: 14, marginBottom: 24 }}>
            {[
              { icon: '📈', label: 'Ingresos del mes', value: `€${totalIngMes.toFixed(2)}`, color: '#3DDB6E' },
              { icon: '📉', label: 'Gastos del mes',   value: `€${totalGasMes.toFixed(2)}`, color: '#FF5757' },
              { icon: '📊', label: 'Margen neto',      value: `${kpis.margen.toFixed(1)}%`,  color: '#F5C842' },
              { icon: '🔥', label: 'Burn rate',        value: `€${kpis.burnRate.toFixed(2)}`, color: '#F97316', sub: 'promedio mensual' },
              { icon: '⏱️', label: 'Runway',           value: kpis.runway !== null ? `${kpis.runway} meses` : '∞', color: '#5AB4FF', sub: 'con el balance actual' },
              { icon: '👤', label: 'Ingreso/cliente',  value: `€${kpis.ingCliente.toFixed(2)}`, color: '#1aad9e', sub: 'este mes' },
            ].map(({ icon, label, value, color, sub }) => (
              <div key={label} style={{ ...cardStyle, borderTop: `2px solid ${color}22` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
                </div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color, letterSpacing: '-0.02em' }}>{value}</div>
                {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* Evolución mensual — área */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.88rem', marginBottom: 20 }}>Evolución mensual</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mesesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3DDB6E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3DDB6E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF5757" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF5757" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }} />
                <Area type="monotone" dataKey="Ingresos" stroke="#3DDB6E" strokeWidth={2} fill="url(#colorIng)" dot={false} />
                <Area type="monotone" dataKey="Gastos"   stroke="#FF5757" strokeWidth={2} fill="url(#colorGas)"  dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Comparativa mensual + Gastos por categoría */}
          <div className="rg-2" style={{ gap: 20, marginBottom: 20 }}>

            {/* Barras comparativas */}
            <div style={cardStyle}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.88rem', marginBottom: 20 }}>Comparativa mensual</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mesesData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Ingresos" fill="#3DDB6E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos"   fill="#FF5757" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gastos por categoría */}
            <div style={cardStyle}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.88rem', marginBottom: 20 }}>Gastos por categoría</p>
              {gastosCat.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={gastosCat} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {gastosCat.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {gastosCat.map((c, i) => (
                      <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS_PIE[i % COLORS_PIE.length], flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', flex: 1 }}>{c.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>€{c.value.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sin datos aún</p>
                </div>
              )}
            </div>
          </div>

          {/* Cash flow acumulado */}
          <div style={cardStyle}>
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.88rem', marginBottom: 20 }}>Cash flow acumulado</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cashflow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F5C842" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F5C842" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Cash flow" stroke="#F5C842" strokeWidth={2.5}
                  dot={{ fill: '#F5C842', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#F5C842' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Layout>
  )
}
