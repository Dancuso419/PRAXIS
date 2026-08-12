import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CandidateCard from '../components/CandidateCard';
import Countdown from '../components/Countdown';

export default function ElectionDetails() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchElection() {
      try {
        const { data } = await axiosInstance.get(`/elections/${id}`);
        setElection(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load election.');
      } finally {
        setLoading(false);
      }
    }
    fetchElection();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div> Loading election...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!election) return <div className="alert alert-error">Election not found.</div>;

  const isActive = election.status === 'ACTIVE';
  const now = new Date();
  const start = new Date(election.startTime);
  const end = new Date(election.endTime);

  return (
    <div className="election-details">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)' }}>
        <h1>{election.title}</h1>
        <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{election.description}</p>
        
        <div className="election-meta" style={{ marginTop: '20px', marginBottom: '0', padding: '0', border: 'none', background: 'transparent', boxShadow: 'none', display: 'flex', gap: '24px' }}>
          <span><strong>Status:</strong> <span className={`status-badge status-${election.status?.toLowerCase()}`}>{election.status}</span></span>
          <span><strong>Start:</strong> {start.toLocaleString()}</span>
          <span><strong>End:</strong> {end.toLocaleString()}</span>
        </div>
      </div>

      {election.status === 'ACTIVE' && <Countdown endTime={election.endTime} />}

      <div style={{ marginBottom: '28px', display: 'flex', gap: '12px' }}>
        {isActive && now >= start && now <= end && (
          <Link to={`/elections/${id}/vote`} className="btn btn-primary">Cast Your Vote</Link>
        )}
        {election.status === 'RESULTS_PUBLISHED' && (
          <Link to={`/elections/${id}/results`} className="btn btn-secondary">View Results</Link>
        )}
      </div>

      <div className="positions-section">
        {election.positions?.map((position) => (
          <div key={position.id} className="position-group">
            <h2>{position.title}</h2>
            <div className="candidates-grid">
              {position.candidates?.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
              {(!position.candidates || position.candidates.length === 0) && (
                <p className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'left', padding: '16px 0' }}>No candidates added to this position yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
