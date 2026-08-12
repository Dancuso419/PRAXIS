import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [electionForm, setElectionForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
  });
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState('');
  const [message, setMessage] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    fetchElections();
    if (isSuperAdmin) fetchAuditLogs();
  }, [isSuperAdmin]);

  async function fetchElections() {
    try {
      const { data } = await axiosInstance.get('/elections');
      setElections(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAuditLogs() {
    try {
      const { data } = await axiosInstance.get('/audit-logs');
      setAuditLogs(data);
    } catch (err) {
      console.error(err);
    }
  }

  function addPosition() {
    if (newPosition.trim()) {
      setPositions([...positions, { title: newPosition.trim() }]);
      setNewPosition('');
    }
  }

  function removePosition(index) {
    setPositions(positions.filter((_, i) => i !== index));
  }

  async function handleCreateElection(e) {
    e.preventDefault();
    setMessage('');
    try {
      const { data } = await axiosInstance.post('/elections', {
        ...electionForm,
        positions,
      });
      setMessage(`Election "${data.title}" created successfully.`);
      setShowCreate(false);
      setElectionForm({ title: '', description: '', startTime: '', endTime: '' });
      setPositions([]);
      fetchElections();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create election.');
    }
  }

  async function handleActivate(id) {
    try {
      await axiosInstance.post(`/elections/${id}/activate`);
      fetchElections();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to activate.');
    }
  }

  async function handleClose(id) {
    try {
      await axiosInstance.post(`/elections/${id}/close`);
      fetchElections();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close.');
    }
  }

  async function handlePublish(id) {
    try {
      await axiosInstance.post(`/vote/elections/${id}/publish-results`);
      fetchElections();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to publish results.');
    }
  }

  const activeCount = elections.filter(e => e.computedStatus === 'ACTIVE' || e.status === 'ACTIVE').length;
  const draftCount = elections.filter(e => e.status === 'DRAFT').length;
  const closedCount = elections.filter(e => e.status === 'CLOSED' || e.status === 'RESULTS_PUBLISHED').length;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Panel</h1>
        <p>Manage elections, candidates, and announcements</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <span className="stat-card-label">Total Elections</span>
          <span className="stat-card-value">{elections.length}</span>
        </div>
        <div className="stat-card stat-card-green">
          <span className="stat-card-label">Active</span>
          <span className="stat-card-value">{activeCount}</span>
        </div>
        <div className="stat-card stat-card-yellow">
          <span className="stat-card-label">Drafts</span>
          <span className="stat-card-value">{draftCount}</span>
        </div>
        <div className="stat-card stat-card-lavender">
          <span className="stat-card-label">Completed</span>
          <span className="stat-card-value">{closedCount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="admin-actions">
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <Icon name={showCreate ? 'x' : 'sparkles'} size={16} /> {showCreate ? 'Cancel' : 'Create Election'}
        </button>
        <Link to="/admin/announcements" className="btn btn-secondary"><Icon name="megaphone" size={16} /> Announcements</Link>
        <Link to="/dashboard" className="btn btn-ghost"><Icon name="arrowLeft" size={16} /> Student View</Link>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {/* Create Election Form */}
      {showCreate && (
        <form className="create-election-form" onSubmit={handleCreateElection}>
          <h2>New Election</h2>
          <div className="form-group">
            <label>Title</label>
            <input value={electionForm.title} onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })} placeholder="e.g. Student Union President 2026" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={electionForm.description} onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })} placeholder="Describe the election..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input type="datetime-local" value={electionForm.startTime} onChange={(e) => setElectionForm({ ...electionForm, startTime: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="datetime-local" value={electionForm.endTime} onChange={(e) => setElectionForm({ ...electionForm, endTime: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Positions</label>
            <div className="position-input-group">
              <input value={newPosition} onChange={(e) => setNewPosition(e.target.value)} placeholder="e.g. President, Vice President..." />
              <button type="button" className="btn btn-small btn-secondary" onClick={addPosition}>Add</button>
            </div>
            <ul className="position-list">
              {positions.map((p, i) => (
                <li key={i}>{p.title} <button type="button" onClick={() => removePosition(i)}>&times;</button></li>
              ))}
            </ul>
          </div>
          <button type="submit" className="btn btn-primary">Create Election</button>
        </form>
      )}

      {/* Elections Table */}
      <div className="elections-table">
        <h2>All Elections</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.title}</td>
                <td><span className={`status-badge status-${e.status?.toLowerCase()}`}>{e.status}</span></td>
                <td>{new Date(e.startTime).toLocaleString()}</td>
                <td>{new Date(e.endTime).toLocaleString()}</td>
                <td className="action-cell">
                  <Link to={`/admin/candidates?electionId=${e.id}`} className="btn btn-small btn-secondary">Candidates</Link>
                  {(e.status === 'ACTIVE' || e.status === 'CLOSED' || e.status === 'RESULTS_PUBLISHED') && (
                    <Link to={`/admin/elections/${e.id}/tally`} className="btn btn-small btn-secondary">Live Tally</Link>
                  )}
                  {isSuperAdmin && e.status === 'DRAFT' && (
                    <button className="btn btn-small btn-success" onClick={() => handleActivate(e.id)}>Activate</button>
                  )}
                  {isSuperAdmin && e.status === 'SCHEDULED' && (
                    <button className="btn btn-small btn-success" onClick={() => handleActivate(e.id)}>Activate</button>
                  )}
                  {isSuperAdmin && e.status === 'ACTIVE' && (
                    <button className="btn btn-small btn-warning" onClick={() => handleClose(e.id)}>Close</button>
                  )}
                  {isSuperAdmin && e.status === 'CLOSED' && (
                    <button className="btn btn-small btn-success" onClick={() => handlePublish(e.id)}>Publish</button>
                  )}
                  {isSuperAdmin && e.status === 'RESULTS_PUBLISHED' && (
                    <Link to={`/elections/${e.id}/results`} className="btn btn-small btn-secondary">Results</Link>
                  )}
                  <Link to={`/admin/eligibility?electionId=${e.id}`} className="btn btn-small btn-ghost">Eligibility</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Logs */}
      {isSuperAdmin && (
        <div className="audit-section">
          <h2 className="section-heading"><Icon name="search" size={18} /> Audit Logs</h2>
          <div className="audit-log-list">
            {auditLogs.length === 0 && <p className="empty-state" style={{ padding: '24px' }}>No audit logs yet.</p>}
            {auditLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="audit-log-entry">
                <span className="audit-action">{log.action}</span>
                <span className="audit-details">{log.details}</span>
                <span className="audit-time">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
