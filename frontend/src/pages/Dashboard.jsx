import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import ElectionCard from '../components/ElectionCard';
import Icon from '../components/Icon';

export default function Dashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [elecRes, annRes] = await Promise.all([
          axiosInstance.get('/elections'),
          axiosInstance.get('/announcements'),
        ]);
        setElections(elecRes.data);
        setAnnouncements(annRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div> Loading dashboard...</div>;

  const activeElections = elections.filter((e) => e.computedStatus === 'ACTIVE');
  const upcomingElections = elections.filter((e) => e.status === 'SCHEDULED');
  const pastElections = elections.filter((e) => e.status === 'CLOSED' || e.status === 'RESULTS_PUBLISHED');

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.fullName?.split(' ')[0]}</h1>
        <p>Matric: {user?.matricNumber} · {user?.department}, {user?.level} Level</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-yellow">
          <span className="stat-card-label">Active Elections</span>
          <span className="stat-card-value">{activeElections.length}</span>
          <span className="stat-card-footer">Open for voting now</span>
        </div>
        <div className="stat-card stat-card-green">
          <span className="stat-card-label">Upcoming</span>
          <span className="stat-card-value">{upcomingElections.length}</span>
          <span className="stat-card-footer">Scheduled elections</span>
        </div>
        <div className="stat-card stat-card-blue">
          <span className="stat-card-label">Completed</span>
          <span className="stat-card-value">{pastElections.length}</span>
          <span className="stat-card-footer">Past elections</span>
        </div>
        <div className="stat-card stat-card-lavender">
          <span className="stat-card-label">Announcements</span>
          <span className="stat-card-value">{announcements.length}</span>
          <span className="stat-card-footer">Updates & notices</span>
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="announcements">
          <h2 className="section-heading"><Icon name="megaphone" size={18} /> Announcements</h2>
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="announcement-card">
              <h3>{a.title}</h3>
              <p>{a.content}</p>
              <small>{new Date(a.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </section>
      )}

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <section>
          <h2 className="section-heading"><Icon name="checkCircle" size={18} className="ico-success" /> Active Elections</h2>
          <div className="election-grid">
            {activeElections.map((e) => (
              <ElectionCard key={e.id} election={e} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <section>
          <h2 className="section-heading"><Icon name="calendar" size={18} /> Upcoming Elections</h2>
          <div className="election-grid">
            {upcomingElections.map((e) => (
              <ElectionCard key={e.id} election={e} />
            ))}
          </div>
        </section>
      )}

      {/* Past Elections */}
      {pastElections.length > 0 && (
        <section>
          <h2 className="section-heading"><Icon name="archive" size={18} /> Past Elections</h2>
          <div className="election-grid">
            {pastElections.map((e) => (
              <ElectionCard key={e.id} election={e} />
            ))}
          </div>
        </section>
      )}

      {elections.length === 0 && (
        <p className="empty-state">No elections available at this time. Check back soon!</p>
      )}
    </div>
  );
}
