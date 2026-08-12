import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Icon from '../components/Icon';

const POLL_MS = 5000;

export default function LiveTally() {
  const { electionId } = useParams();
  const [tally, setTally] = useState(null);
  const [turnout, setTurnout] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [tallyRes, turnoutRes] = await Promise.all([
        axiosInstance.get(`/vote/elections/${electionId}/live-tally`),
        axiosInstance.get(`/vote/elections/${electionId}/turnout`),
      ]);
      setTally(tallyRes.data);
      setTurnout(turnoutRes.data);
      setUpdatedAt(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load live tally.');
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [load]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" /> Loading live tally...
      </div>
    );
  }

  if (error && !tally) {
    return <div className="alert alert-error"><Icon name="alertCircle" size={16} /> {error}</div>;
  }

  const isLive = tally?.status === 'ACTIVE';

  return (
    <div className="admin-page live-tally" style={{ maxWidth: '960px' }}>
      <Link to="/admin" className="back-link"><Icon name="arrowLeft" size={15} /> Admin Panel</Link>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>{tally?.electionTitle}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Live vote tally. This view is restricted to administrators and is not visible to voters.
          </p>
        </div>
        <span className={`tally-live-pill ${isLive ? 'is-live' : ''}`}>
          {isLive ? <><span className="tally-live-dot" /> Live</> : (tally?.status || '').replace(/_/g, ' ')}
        </span>
      </div>

      {/* Turnout summary */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card stat-card-blue">
          <span className="stat-card-label">Total Votes Cast</span>
          <span className="stat-card-value">{tally?.totalVotesCast ?? 0}</span>
        </div>
        <div className="stat-card stat-card-green">
          <span className="stat-card-label">Unique Voters</span>
          <span className="stat-card-value">{turnout?.uniqueVoters ?? 0}</span>
        </div>
        <div className="stat-card stat-card-yellow">
          <span className="stat-card-label">Eligible Voters</span>
          <span className="stat-card-value">{turnout?.totalEligibleVoters ?? 0}</span>
        </div>
        <div className="stat-card stat-card-lavender">
          <span className="stat-card-label">Turnout</span>
          <span className="stat-card-value">{turnout?.participationPercent ?? 0}%</span>
        </div>
      </div>

      {/* Per position tallies */}
      {tally?.results?.map((position) => {
        const total = position.totalVotes || 0;
        const leader = position.candidates[0];
        return (
          <div key={position.positionId} className="tally-position">
            <div className="tally-position-head">
              <h2>{position.position}</h2>
              <span className="tally-position-total">{total} vote{total === 1 ? '' : 's'}</span>
            </div>

            {position.candidates.length === 0 ? (
              <p className="empty-state" style={{ padding: '20px' }}>No candidates for this position.</p>
            ) : (
              <div className="tally-bars">
                {position.candidates.map((c) => {
                  const pct = total > 0 ? Math.round((c.voteCount / total) * 100) : 0;
                  const isLeader = total > 0 && c.id === leader.id && c.voteCount > 0;
                  return (
                    <div key={c.id} className={`tally-row ${c.isDisqualified ? 'is-dq' : ''}`}>
                      <div className="tally-row-top">
                        <span className="tally-name">
                          {c.fullName}
                          {isLeader && <span className="tally-leader"><Icon name="trophy" size={13} /> Leading</span>}
                          {c.isDisqualified && <span className="tally-dq">Disqualified</span>}
                        </span>
                        <span className="tally-figures">
                          <strong>{c.voteCount}</strong> <span>({pct}%)</span>
                        </span>
                      </div>
                      <div className="tally-track">
                        <div
                          className={`tally-fill ${isLeader ? 'is-leader' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <p className="tally-updated">
        {error ? (
          <span style={{ color: 'var(--danger)' }}>Update failed, retrying...</span>
        ) : (
          <>Auto refreshing every {POLL_MS / 1000}s. Last updated {updatedAt?.toLocaleTimeString()}.</>
        )}
      </p>
    </div>
  );
}
