import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function EligibilityPage() {
  const [searchParams] = useSearchParams();
  const electionId = searchParams.get('electionId');
  const [election, setElection] = useState(null);
  const [form, setForm] = useState({ faculty: '', department: '', level: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (electionId) {
      async function fetch() {
        const { data } = await axiosInstance.get(`/elections/${electionId}`);
        setElection(data);
        if (data.eligibility) {
          setForm({
            faculty: data.eligibility.faculty || '',
            department: data.eligibility.department || '',
            level: data.eligibility.level || '',
          });
        }
      }
      fetch();
    }
  }, [electionId]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axiosInstance.put(`/elections/${electionId}/eligibility`, form);
      setMessage('Eligibility rules updated.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update.');
    }
  }

  if (!electionId || !election) return <div className="loading-screen"><div className="loading-spinner"></div> Loading...</div>;

  return (
    <div className="admin-page" style={{ maxWidth: '800px' }}>
      <Link to="/admin" className="back-link">← Admin Panel</Link>
      <h1>Set Eligibility Rules</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Restrict voting for <strong>{election.title}</strong> by specifying criteria below. Leave fields blank to allow all students to vote.</p>
      
      {message && <div className="alert alert-info">{message}</div>}
      
      <form onSubmit={handleSubmit} className="create-form">
        <h2>Eligibility Criteria</h2>
        
        <div className="form-group">
          <label>Faculty (leave blank for all)</label>
          <input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="e.g. Science" />
        </div>
        
        <div className="form-group">
          <label>Department (leave blank for all)</label>
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Physics" />
        </div>
        
        <div className="form-group">
          <label>Level (leave blank for all)</label>
          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="">All Levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="500">500 Level</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Save Eligibility Rules</button>
      </form>
    </div>
  );
}
