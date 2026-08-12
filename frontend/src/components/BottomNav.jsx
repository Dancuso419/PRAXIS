import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

/* Mobile-only bottom navigation bar. Replaces the hamburger drawer.
   Items adapt to the signed-in role. */
export default function BottomNav() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ELECTION_OFFICER' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const items = [{ to: '/dashboard', icon: 'grid', label: 'Home' }];

  if (!isAdmin) {
    items.push({ to: '/elections', icon: 'ballot', label: 'Elections' });
  }

  if (isAdmin) {
    items.push({ to: '/admin', icon: 'barChart', label: 'Admin', end: true });
    items.push({ to: '/admin/announcements', icon: 'megaphone', label: 'Notices' });
  }
  if (isSuperAdmin) {
    items.push({ to: '/admin/users', icon: 'users', label: 'Users' });
  }
  items.push({ to: '/account', icon: 'settings', label: 'Account' });

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">
            <Icon name={it.icon} size={22} />
          </span>
          <span className="bottom-nav-label">{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
