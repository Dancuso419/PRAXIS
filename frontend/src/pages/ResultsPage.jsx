import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function ResultsPage() {
  const { electionId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResults() {
      try {
        const { data } = await axiosInstance.get(`/vote/elections/${electionId}/results`);
        setResults(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load results.');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [electionId]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div> Loading results...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!results) return null;

  return (
    <div className="results-page">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      <h1>Results - {results.electionTitle}</h1>
      
      {results.results?.map((pos) => (
        <div key={pos.positionId} className="result-position">
          <h2>{pos.position}</h2>
          <p>Total Votes Cast: <strong>{pos.totalVotes}</strong></p>
          
          <div className="result-candidates" style={{ marginTop: '16px' }}>
            {pos.candidates?.map((c, i) => {
              const percentVal = pos.totalVotes > 0 ? (c.voteCount / pos.totalVotes) * 100 : 0;
              return (
                <div key={c.id} className={`result-row ${i === 0 && c.voteCount > 0 ? 'winner' : ''}`}>
                  <span className="rank">#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="name">{c.fullName}</span>
                      <span className="votes">{c.voteCount} votes ({percentVal.toFixed(1)}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentVal}%`,
                        height: '100%',
                        background: i === 0 && c.voteCount > 0 ? 'var(--warning)' : 'var(--primary)',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!pos.candidates || pos.candidates.length === 0) && (
              <p className="empty-state" style={{ textAlign: 'left', padding: '12px 0' }}>No candidates were registered for this position.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
