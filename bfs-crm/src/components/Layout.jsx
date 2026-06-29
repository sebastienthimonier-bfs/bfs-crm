import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, BarChart2, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/pipeline',  label: 'Pipeline',   icon: Users },
  { to: '/stats',     label: 'Stats',      icon: BarChart2 },
]

export default function Layout() {
  const { profile, signOut } = useAuth()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', marginBottom: 28 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--primary)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>🎯</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>BFS</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CRM Pipeline</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg3)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.15s',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.nom || '—'}</div>
            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'capitalize',
            }}>{profile?.role}</div>
          </div>
          <button
            onClick={signOut}
            className="btn btn-ghost btn-sm"
            title="Déconnexion"
            style={{ padding: '6px 8px' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        background: 'var(--bg)',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
