import Icon from './Icon';

/* On-brand hero scene: a secure ballot box with floating
   "live results" and "verified" cards. Motion is CSS-driven
   and respects prefers-reduced-motion. */
export default function HeroVisual() {
  return (
    <div className="hero-visual" role="img" aria-label="Secure e-voting illustration">
      <div className="hero-visual-glow" aria-hidden="true" />

      {/* Central ballot card */}
      <div className="hv-card hv-card-main">
        <div className="hv-ballot">
          <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <rect x="14" y="52" width="92" height="54" rx="10" fill="#E4F3EA" stroke="#BEE6CE" strokeWidth="2" />
            <path d="M14 70h92" stroke="#BEE6CE" strokeWidth="2" />
            <rect x="46" y="62" width="28" height="5" rx="2.5" fill="#0D7E45" />
            {/* ballot slot */}
            <rect x="40" y="49" width="40" height="7" rx="3.5" fill="#09622F" />
            {/* the slip */}
            <g className="hv-slip">
              <rect x="42" y="8" width="36" height="44" rx="6" fill="#FCFBF7" stroke="#BEE6CE" strokeWidth="2" />
              <path d="M50 22h20M50 30h20M50 38h12" stroke="#B0B4C8" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="60" cy="16" r="0" />
            </g>
            {/* check seal */}
            <circle cx="86" cy="90" r="15" fill="#22C55E" />
            <path d="m80 90 4 4 8-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="hv-card-main-label">
          <strong>Ballot cast securely</strong>
          <span>Encrypted &amp; anonymized</span>
        </div>
      </div>

      {/* Floating: live results */}
      <div className="hv-card hv-card-results hv-float">
        <div className="hv-card-head">
          <span className="hv-dot" /> Live Results
        </div>
        <div className="hv-bars">
          <span style={{ '--h': '72%' }} className="hv-bar hv-bar-a" />
          <span style={{ '--h': '48%' }} className="hv-bar hv-bar-b" />
          <span style={{ '--h': '90%' }} className="hv-bar hv-bar-c" />
          <span style={{ '--h': '36%' }} className="hv-bar hv-bar-d" />
        </div>
      </div>

      {/* Floating: verified receipt */}
      <div className="hv-card hv-card-receipt hv-float hv-float-slow">
        <span className="hv-receipt-icon">
          <Icon name="shield" size={18} />
        </span>
        <div className="hv-receipt-text">
          <strong>Vote verified</strong>
          <code>#PX-8F3A21</code>
        </div>
      </div>

      {/* Floating: turnout chip */}
      <div className="hv-card hv-card-turnout hv-float hv-float-slower">
        <span className="hv-turnout-icon">
          <Icon name="users" size={16} />
        </span>
        <div>
          <strong>1,284</strong>
          <span>votes today</span>
        </div>
      </div>
    </div>
  );
}
