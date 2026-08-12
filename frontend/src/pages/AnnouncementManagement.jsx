import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', electionId: '' });
  const [elections, setElections] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [annRes, elecRes] = await Promise.all([
      axiosInstance.get('/announcements'),
      axiosInstance.get('/elections'),
    ]);
    setAnnouncements(annRes.data);
    setElections(elecRes.data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axiosInstance.post('/announcements', form);
      setMessage('Announcement created.');
      setForm({ title: '', content: '', electionId: '' });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create.');
    }
  }

  return (
    <div className="admin-page" style={{ maxWidth: '800px' }}>
      <Link to="/admin" className="back-link">← Admin Panel</Link>
      <h1>Manage Announcements</h1>
      {message && <div className="alert alert-info">{message}</div>}
      
      <form onSubmit={handleSubmit} className="create-form" style={{ marginTop: '20px' }}>
        <h2>Create New Announcement</h2>
        
        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Voting Registration Deadline Extended" required />
        </div>
        
        <div className="form-group">
          <label>Content</label>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={4} placeholder="Write announcement details..." />
        </div>
        
        <div className="form-group">
          <label>Related Election (optional)</label>
          <select value={form.electionId} onChange={(e) => setForm({ ...form, electionId: e.target.value })}>
            <option value="">None</option>
            {elections.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary">Create Announcement</button>
      </form>
      
      <div className="announcements-list" style={{ marginTop: '28px' }}>
        <h2>All Announcements</h2>
        {announcements.map((a) => (
          <div key={a.id} className="announcement-entry">
            <h3>{a.title}</h3>
            <p>{a.content}</p>
            {a.election && (
              <small style={{ color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                Election: {a.election.title}
              </small>
            )}
            <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
              Posted on: {new Date(a.createdAt).toLocaleString()}
            </small>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="empty-state">No announcements created yet.</p>
        )}
      </div>
    </div>
  );
}
