import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Icon from '../components/Icon';

export default function VotePage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    async function fetchElection() {
      try {
        const { data } = await axiosInstance.get(`/elections/${electionId}`);
        setElection(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load election.');
      } finally {
        setLoading(false);
      }
    }
    fetchElection();
  }, [electionId]);

  function handleSelect(positionId, candidateId) {
    setSelectedCandidates({ ...selectedCandidates, [positionId]: candidateId });
  }

  async function handleSubmitVote(positionId) {
    const candidateId = selectedCandidates[positionId];
    if (!candidateId) {
      setError('Please select a candidate.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/vote', {
        electionId,
        positionId,
        candidateId,
      });
      setReceipts([...receipts, { positionId, receiptHash: data.receiptHash, message: data.message }]);
      setSuccess(`Vote cast successfully.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Voting failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div> Loading voting page...</div>;
  if (error && !success) return <div className="alert alert-error">{error}</div>;
  if (!election) return <div className="alert alert-error">Election not found.</div>;

  if (receipts.length > 0 && receipts.length === election.positions?.length) {
    return (
      <div className="vote-confirmation">
        <div className="vote-confirmation-badge"><Icon name="trophy" size={40} /></div>
        <h1>All Votes Cast</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Thank you for voting in <strong>{election.title}</strong>!</p>
        <div className="receipts" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          {receipts.map((r, i) => (
            <div key={i} className="receipt" style={{ width: '100%', maxWidth: '400px' }}>
              <strong>Receipt:</strong> {r.receiptHash}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '24px' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <h1>Cast Your Vote - {election.title}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {election.positions?.map((position) => {
        const alreadyVoted = receipts.some((r) => r.positionId === position.id);
        if (alreadyVoted) {
          return (
            <div key={position.id} className="position-voted" style={{ marginBottom: '20px' }}>
              <h2><Icon name="checkCircle" size={18} /> {position.title} — Voted</h2>
            </div>
          );
        }
        return (
          <div key={position.id} className="position-vote-group">
            <h2><Icon name="ballot" size={18} /> {position.title}</h2>
            <div className="candidates-vote-grid">
              {position.candidates?.filter((c) => !c.isDisqualified).map((candidate) => (
                <div
                  key={candidate.id}
                  className={`candidate-vote-card ${selectedCandidates[position.id] === candidate.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(position.id, candidate.id)}
                >
                  <h3>{candidate.fullName}</h3>
                  <p className="slogan">{candidate.slogan ? `"${candidate.slogan}"` : ''}</p>
                  <p className="manifesto-preview">{candidate.manifesto?.substring(0, 150)}...</p>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => handleSubmitVote(position.id)}
              disabled={submitting || !selectedCandidates[position.id]}
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
