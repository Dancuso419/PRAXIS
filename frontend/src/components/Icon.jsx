/* ================================================================
   Icon — single consistent stroke-icon system for Praxis.
   Lucide-style, 24x24 grid, inherits color via `currentColor`.
   Usage: <Icon name="search" /> · <Icon name="bell" size={18} />
   ================================================================ */

const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  megaphone: (
    <>
      <path d="m3 11 15-7v16l-15-7v-2Z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.2-3" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
    </>
  ),
  cap: (
    <>
      <path d="M22 9 12 4 2 9l10 5 10-5Z" />
      <path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M22 9v5" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5 13.9 9 19.4 10.9 13.9 12.8 12 18.3 10.1 12.8 4.6 10.9 10.1 9 12 3.5Z" />
      <path d="M19 15.5 19.8 18 22.3 18.8 19.8 19.6 19 22.1 18.2 19.6 15.7 18.8 18.2 18 19 15.5Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.4 2.9 7.8 7 9 4.1-1.2 7-4.6 7-9V6l-7-3Z" />
      <path d="m9 11.5 2 2 4-4.5" />
    </>
  ),
  barChart: (
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="0.8" />
      <rect x="12.5" y="7" width="3" height="10" rx="0.8" />
      <rect x="18" y="13" width="3" height="4" rx="0.8" />
    </>
  ),
  zap: (
    <>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18M6 6l12 12" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  ballot: (
    <>
      <path d="M4 21h16M6 21V7l6-4 6 4v14" />
      <path d="M9.5 12.5 11 14l3.5-4" />
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M5 5.5 3 12v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6l-2-6.5A2 2 0 0 0 17.1 4H6.9A2 2 0 0 0 5 5.5Z" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.5M12 16h.01" />
    </>
  ),
  chevronDown: (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),
  chevronLeft: (
    <>
      <path d="m15 18-6-6 6-6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="m10.5 12.5 8-8M17 5l2.5 2.5M15 7l2 2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.4 3.1M6.1 6.1A13.3 13.3 0 0 0 2 12s3.5 7 10 7a9.3 9.3 0 0 0 4-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
};

export default function Icon({ name, size = 20, strokeWidth = 1.9, className = '', ...rest }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  );
}
