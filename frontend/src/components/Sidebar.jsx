import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Icon from './Icon';

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'ELECTION_OFFICER' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  function formatRole(role) {
    if (!role) return '';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <Icon name={mobileOpen ? 'x' : 'menu'} size={20} />
      </button>

      <div className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`} onClick={closeMobile} />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <Icon name="chevronLeft" size={16} className={collapsed ? 'flip' : ''} />
        </button>

        <div className="sidebar-brand">
          <div className="sidebar-logo">P</div>
          <span className="sidebar-brand-text">Praxis</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main Menu</span>

          <NavLink to="/dashboard" title="Dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="sidebar-label">Dashboard</span>
          </NavLink>

          {isAdmin && (
            <>
              <span className="sidebar-section-label">Administration</span>

              <NavLink to="/admin" end title="Admin Panel" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                </svg>
                <span className="sidebar-label">Admin Panel</span>
              </NavLink>

              <NavLink to="/admin/announcements" title="Announcements" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="sidebar-label">Announcements</span>
              </NavLink>

              {isSuperAdmin && (
                <NavLink to="/admin/users" title="User Management" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                  <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
                  </svg>
                  <span className="sidebar-label">User Management</span>
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user?.fullName)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
              <div className="sidebar-user-role">{formatRole(user?.role)}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <Icon name="logout" size={16} />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
