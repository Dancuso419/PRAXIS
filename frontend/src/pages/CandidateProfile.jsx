import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function CandidateProfile() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const { data } = await axiosInstance.get(`/candidates/${id}`);
        setCandidate(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div> Loading profile...</div>;
  if (!candidate) return <div className="alert alert-error">Candidate not found.</div>;

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="candidate-profile" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to={`/elections/${candidate.electionId}`} className="back-link">← Back to Election</Link>
      
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '36px', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
        {candidate.profilePicture ? (
          <img src={candidate.profilePicture} alt={candidate.fullName} className="profile-img" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-2))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', boxShadow: '0 4px 12px rgba(13, 126, 69, 0.3)' }}>
            {getInitials(candidate.fullName)}
          </div>
        )}
        
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>{candidate.fullName}</h1>
        {candidate.slogan && <p className="slogan" style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '4px' }}>"{candidate.slogan}"</p>}
        
        <div className="profile-meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px', width: '100%' }}>
          <span style={{ padding: '4px 12px', background: 'var(--accent-blue)', color: 'var(--accent-blue-text)', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>Position: {candidate.position?.title}</span>
          <span style={{ padding: '4px 12px', background: 'var(--bg)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>Dept: {candidate.department}</span>
          <span style={{ padding: '4px 12px', background: 'var(--bg)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>Level: {candidate.level} Level</span>
        </div>
      </div>

      <div className="manifesto" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '36px', boxShadow: 'var(--shadow-xs)' }}>
        <h2>Manifesto</h2>
        <p style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>{candidate.manifesto}</p>
      </div>
    </div>
  );
}
