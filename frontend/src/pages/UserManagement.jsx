import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import Icon from '../components/Icon';
import PasswordInput from '../components/PasswordInput';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const EMPTY_FORM = { fullName: '', email: '', password: '', department: '' };

export default function UserManagement() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOfficers = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/admin/officers');
      setOfficers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load officers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOfficers(); }, [fetchOfficers]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/admin/officers', form);
      setOfficers([data, ...officers]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess(`Election Officer "${data.fullName}" created successfully.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create officer.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(officer) {
    if (!window.confirm(`Remove "${officer.fullName}" (${officer.email})? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    setRemoving(officer.id);
    try {
      await axiosInstance.delete(`/admin/officers/${officer.id}`);
      setOfficers(officers.filter((o) => o.id !== officer.id));
      setSuccess(`Removed ${officer.fullName}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove officer.');
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        Loading…
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>User Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Create and manage Election Officer accounts. Only Super Admins can access this page.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          >
            <Icon name={showForm ? 'x' : 'users'} size={16} />
            {showForm ? 'Cancel' : 'Add Officer'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error"><Icon name="alertCircle" size={16} /> {error}</div>}
      {success && <div className="alert alert-success"><Icon name="checkCircle" size={16} /> {success}</div>}

      {showForm && (
        <form className="create-form" onSubmit={handleCreate}>
          <h2>New Election Officer</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '-12px' }}>
            The account is created pre-verified and can log in immediately. The matric number is auto-generated.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Amara Okafor"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. officer@praxis.edu"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. ICT (default)"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Officer'}
          </button>
        </form>
      )}

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card stat-card-blue">
          <span className="stat-card-label">Election Officers</span>
          <span className="stat-card-value">{officers.length}</span>
          <span className="stat-card-footer">Active accounts</span>
        </div>
      </div>

      {/* Officers table */}
      <div className="elections-table">
        <h2>Election Officers</h2>

        {officers.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div style={{ marginBottom: '10px', color: 'var(--text-light)' }}>
              <Icon name="users" size={36} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No election officers yet</p>
            <p style={{ marginTop: '4px' }}>Use "Add Officer" above to create the first one.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Matric / Staff ID</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                      }}>
                        {o.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      {o.fullName}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{o.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{o.department}</td>
                  <td>
                    <code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.matricNumber}</code>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{timeAgo(o.createdAt)}</td>
                  <td className="action-cell">
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleRemove(o)}
                      disabled={removing === o.id}
                    >
                      {removing === o.id ? 'Removing…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
