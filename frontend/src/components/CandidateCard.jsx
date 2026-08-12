import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function CandidateCard({ candidate }) {
  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className={`candidate-card ${candidate.isDisqualified ? 'disqualified' : ''}`}>
      {candidate.profilePicture ? (
        <img src={candidate.profilePicture} alt={candidate.fullName} className="candidate-img" />
      ) : (
        <div style={{
          width: '100%',
          height: '140px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, var(--primary-light), var(--accent-lavender))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          fontSize: '2rem',
          fontWeight: 800,
          marginBottom: '12px'
        }}>
          {getInitials(candidate.fullName)}
        </div>
      )}
      
      <h3>{candidate.fullName}</h3>
      {candidate.slogan && <p className="slogan">"{candidate.slogan}"</p>}
      <p className="candidate-dept"><Icon name="cap" size={15} /> {candidate.department} · {candidate.level} Level</p>
      <p className="manifesto-preview">{candidate.manifesto?.substring(0, 120)}{candidate.manifesto?.length > 120 ? '...' : ''}</p>
      
      {candidate.isDisqualified && (
        <span className="disqualified-badge">Disqualified: {candidate.disqualifyReason}</span>
      )}
      
      <div style={{ marginTop: '14px' }}>
        <Link to={`/candidates/${candidate.id}`} className="btn btn-small btn-secondary" style={{ width: '100%' }}>
          View Profile
        </Link>
      </div>
    </div>
  );
}
