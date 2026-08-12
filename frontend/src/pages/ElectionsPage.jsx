import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import ElectionCard from '../components/ElectionCard';
import Icon from '../components/Icon';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchElections() {
      try {
        const { data } = await axiosInstance.get('/elections');
        setElections(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchElections();
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /> Loading elections...</div>;
  }

  const statusOf = (e) => {
    const s = e.computedStatus || e.status;
    if (s === 'ACTIVE') return 'active';
    if (s === 'SCHEDULED') return 'upcoming';
    if (s === 'CLOSED' || s === 'RESULTS_PUBLISHED') return 'past';
    return 'other';
  };

  const counts = elections.reduce(
    (acc, e) => {
      const g = statusOf(e);
      if (acc[g] !== undefined) acc[g] += 1;
      return acc;
    },
    { active: 0, upcoming: 0, past: 0 }
  );

  const visible = filter === 'all' ? elections : elections.filter((e) => statusOf(e) === filter);

  return (
    <div className="elections-page">
      <div className="dashboard-header">
        <h1>Elections</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
          Browse every election, read candidate manifestos, and cast your vote.
        </p>
      </div>

      <div className="filter-chips">
        {FILTERS.map((f) => {
          const count = f.key === 'all' ? elections.length : counts[f.key];
          return (
            <button
              key={f.key}
              className={`filter-chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="filter-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state" style={{ padding: '56px 24px' }}>
          <div style={{ color: 'var(--text-light)', marginBottom: '10px' }}>
            <Icon name="ballot" size={36} />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No elections here yet</p>
          <p style={{ marginTop: '4px' }}>
            {filter === 'all' ? 'Check back soon for upcoming elections.' : 'Try a different filter above.'}
          </p>
        </div>
      ) : (
        <div className="election-grid">
          {visible.map((e) => (
            <ElectionCard key={e.id} election={e} />
          ))}
        </div>
      )}
    </div>
  );
}
