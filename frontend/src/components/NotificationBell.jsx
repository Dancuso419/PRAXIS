import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Icon from './Icon';

const SEEN_KEY = 'praxis_notifications_seen';

function timeAgo(dateStr) {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [seenAt, setSeenAt] = useState(() =>
    Number(localStorage.getItem(SEEN_KEY) || 0)
  );
  const rootRef = useRef(null);

  useEffect(() => {
    let alive = true;
    axiosInstance
      .get('/announcements')
      .then((res) => {
        if (!alive) return;
        const list = Array.isArray(res.data) ? res.data : [];
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItems(list);
      })
      .catch((err) => console.error('Notifications load failed', err));
    return () => {
      alive = false;
    };
  }, []);

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

  const unread = items.filter((a) => new Date(a.createdAt).getTime() > seenAt);
  const unreadCount = unread.length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setSeenAt(now);
    }
  }

  return (
    <div className="notif" ref={rootRef}>
      <button
        type="button"
        className="header-notification"
        onClick={toggle}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <Icon name="bell" size={19} />
        {unreadCount > 0 && (
          <span className="header-notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="menu">
          <div className="notif-panel-head">
            <span>Notifications</span>
            {unreadCount > 0 && <span className="notif-panel-count">{unreadCount} new</span>}
          </div>

          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">
                <span className="notif-empty-icon">
                  <Icon name="inbox" size={26} />
                </span>
                <p>You're all caught up</p>
                <small>New announcements will appear here.</small>
              </div>
            ) : (
              items.slice(0, 8).map((a) => {
                const isUnread = new Date(a.createdAt).getTime() > seenAt;
                return (
                  <div
                    key={a.id}
                    className={`notif-item ${isUnread ? 'unread' : ''}`}
                  >
                    <span className="notif-item-icon">
                      <Icon name="megaphone" size={16} />
                    </span>
                    <span className="notif-item-body">
                      <span className="notif-item-title">{a.title}</span>
                      <span className="notif-item-text">{a.content}</span>
                      <span className="notif-item-time">{timeAgo(a.createdAt)}</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <button
              type="button"
              className="notif-panel-foot"
              onClick={() => {
                setOpen(false);
                navigate('/dashboard');
              }}
            >
              View all on dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}
