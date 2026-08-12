import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatRole(role) {
  if (!role) return '';
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const isAdmin = user?.role === 'ELECTION_OFFICER' || user?.role === 'SUPER_ADMIN';

  function go(path) {
    setOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <div className="account" ref={rootRef}>
      <button
        type="button"
        className={`header-user ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="header-avatar">{getInitials(user?.fullName)}</div>
        <Icon name="chevronDown" size={16} className="account-caret" />
      </button>

      {open && (
        <div className="account-panel" role="menu">
          <div className="account-panel-head">
            <div className="account-avatar-lg">{getInitials(user?.fullName)}</div>
            <div className="account-identity">
              <span className="account-name">{user?.fullName || 'User'}</span>
              <span className="account-email">{user?.email}</span>
              <span className="account-role-badge">{formatRole(user?.role)}</span>
            </div>
          </div>

          <div className="account-menu-list">
            <button className="account-menu-item" role="menuitem" onClick={() => go('/account')}>
              <Icon name="settings" size={17} />
              Account Settings
            </button>
            <button className="account-menu-item" role="menuitem" onClick={() => go('/dashboard')}>
              <Icon name="grid" size={17} />
              Dashboard
            </button>
            {isAdmin && (
              <button className="account-menu-item" role="menuitem" onClick={() => go('/admin')}>
                <Icon name="barChart" size={17} />
                Admin Panel
              </button>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <button className="account-menu-item" role="menuitem" onClick={() => go('/admin/users')}>
                <Icon name="users" size={17} />
                User Management
              </button>
            )}
          </div>

          <div className="account-menu-foot">
            <button className="account-menu-item account-menu-item-danger" role="menuitem" onClick={handleLogout}>
              <Icon name="logout" size={17} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
