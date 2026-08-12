import NotificationBell from './NotificationBell';
import AccountMenu from './AccountMenu';

export default function Header({ title }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title || 'Dashboard'}</h1>
      </div>

      <div className="header-right">
        <NotificationBell />
        <AccountMenu />
      </div>
    </header>
  );
}
