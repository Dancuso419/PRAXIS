import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function CandidateManagement() {
  const [searchParams] = useSearchParams();
  const electionId = searchParams.get('electionId');
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    fullName: '', department: '', level: '', manifesto: '', slogan: '', positionTitle: '',
  });

  useEffect(() => {
    if (electionId) {
      fetchElection();
      fetchCandidates();
    }
  }, [electionId]);

  async function fetchElection() {
    const { data } = await axiosInstance.get(`/elections/${electionId}`);
    setElection(data);
  }

  async function fetchCandidates() {
    const { data } = await axiosInstance.get(`/candidates/elections/${electionId}/candidates`);
    setCandidates(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axiosInstance.post('/candidates', { ...form, electionId });
      setMessage('Candidate added successfully.');
      setForm({ fullName: '', department: '', level: '', manifesto: '', slogan: '', positionTitle: '' });
      fetchCandidates();
      fetchElection();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add candidate.');
    }
  }

  async function handleDisqualify(id) {
    const reason = prompt('Enter disqualification reason:');
    if (!reason) return;
    try {
      await axiosInstance.post(`/candidates/${id}/disqualify`, { reason });
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to disqualify.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this candidate?')) return;
    try {
      await axiosInstance.delete(`/candidates/${id}`);
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.');
    }
  }

  if (!electionId) return <div className="alert alert-error">No election specified.</div>;
  if (!election) return <div className="loading-screen"><div className="loading-spinner"></div> Loading...</div>;

  return (
    <div className="admin-page" style={{ maxWidth: '1000px' }}>
      <Link to="/admin" className="back-link">← Admin Panel</Link>
      <h1>Manage Candidates - {election.title}</h1>
      
      {election.status !== 'ACTIVE' && election.status !== 'CLOSED' && (
        <form onSubmit={handleSubmit} className="create-form" style={{ marginTop: '20px' }}>
          <h2>Add Candidate</h2>
          {message && <div className="alert alert-info">{message}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Alice Smith" required />
            </div>
            <div className="form-group">
              <label>Position</label>
              <input
                value={form.positionTitle}
                onChange={(e) => setForm({ ...form, positionTitle: e.target.value })}
                placeholder="e.g. President"
                list="position-options"
                required
              />
              <datalist id="position-options">
                {election.positions?.map((p) => (
                  <option key={p.id} value={p.title} />
                ))}
              </datalist>
              <small className="field-hint">Type a new position or pick an existing one. New positions are created automatically.</small>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Electrical Engineering" required />
            </div>
            <div className="form-group">
              <label>Level</label>
              <input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="e.g. 400" required />
            </div>
          </div>

          <div className="form-group">
            <label>Campaign Slogan</label>
            <input value={form.slogan} onChange={(e) => setForm({ ...form, slogan: e.target.value })} placeholder="e.g. Leadership with Transparency" />
          </div>

          <div className="form-group">
            <label>Manifesto</label>
            <textarea value={form.manifesto} onChange={(e) => setForm({ ...form, manifesto: e.target.value })} required rows={4} placeholder="Write manifesto description..." />
          </div>

          <button type="submit" className="btn btn-primary">Add Candidate</button>
        </form>
      )}

      <div className="elections-table" style={{ marginTop: '24px' }}>
        <h2>Current Candidates</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Dept / Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className={c.isDisqualified ? 'row-disqualified' : ''}>
                <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                <td>{c.position?.title}</td>
                <td>{c.department} / {c.level} Level</td>
                <td>
                  {c.isDisqualified ? (
                    <span className="disqualified-badge" style={{ marginTop: 0 }}>Disqualified: {c.disqualifyReason}</span>
                  ) : (
                    <span className="status-badge status-active">Active</span>
                  )}
                </td>
                <td>
                  <div className="action-cell">
                    {!c.isDisqualified && (
                      <button className="btn btn-small btn-warning" onClick={() => handleDisqualify(c.id)}>Disqualify</button>
                    )}
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-state">No candidates added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
