import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const PAGE_TITLES = {
  home:      'Dashboard',
  pulso:     'Pulso del negocio',
  mentores:  'Sesión de mentoría',
  formacion: 'Formación',
  finanzas:  'Finanzas',
  proyectos: 'Proyectos',
  progreso:  'Mi progreso',
  ajustes:   'Ajustes',
}

export default function Layout({ children, currentPage, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
          <main style={{
      marginLeft: 'var(--sidebar-w)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      transition: 'margin-left 0.3s ease'
    }}>
      <Topbar
        title={PAGE_TITLES[currentPage] || 'Mentor AI'}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div style={{ 
        padding: 32, 
        flex: 1, 
        overflowY: 'auto',    // ← scroll solo en el contenido
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--surface3) transparent'
      }} className="fade-in">
        {children}
      </div>
    </main>
    </div>
  )
}