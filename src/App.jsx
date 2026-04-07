import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Finanzas from './pages/Finanzas'
import Proyectos from './pages/Proyectos'
import Plan from './pages/Plan'
import Formacion from './pages/Formacion'
import Progreso from './pages/Progreso'
import Ajustes from './pages/Ajustes'
import Mentores from './pages/Mentores'
import Pulso from './pages/Pulso'
import Pensamiento from './pages/Pensamiento'
import Contactos from './pages/Contactos'
import Sisi from './pages/Sisi'


function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/auth" replace />
}

function AppInner() {
  const [page, setPage] = useState('home')
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />  // ← corregido

  const pages = {
    home:        <Home        onNavigate={setPage} currentPage={page} />,
    finanzas:    <Finanzas    onNavigate={setPage} currentPage={page} />,
    ingreso:     <Finanzas    onNavigate={setPage} currentPage={page} tab="ingreso" />,
    gasto:       <Finanzas    onNavigate={setPage} currentPage={page} tab="gasto" />,
    proyectos:   <Proyectos   onNavigate={setPage} currentPage={page} />,
    plan:        <Plan        onNavigate={setPage} currentPage={page} />,
    formacion:   <Formacion   onNavigate={setPage} currentPage={page} />,
    progreso:    <Progreso    onNavigate={setPage} currentPage={page} />,
    ajustes:     <Ajustes     onNavigate={setPage} currentPage={page} />,
    mentores:    <Mentores    onNavigate={setPage} currentPage={page} />,
    pulso:       <Pulso       onNavigate={setPage} currentPage={page} />,
    pensamiento: <Pensamiento onNavigate={setPage} currentPage={page} />,
    contactos:   <Contactos   onNavigate={setPage} currentPage={page} />,
    sisi:        <Sisi        onNavigate={setPage} currentPage={page} />,
  }

  return pages[page] || pages['home']
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={<ProtectedRoute><AppInner /></ProtectedRoute>} />
    </Routes>
  )
}