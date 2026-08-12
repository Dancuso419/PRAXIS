import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function ElectionCard({ election }) {
  const statusLabels = {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    ACTIVE: 'Active',
    CLOSED: 'Closed',
    RESULTS_PUBLISHED: 'Results Published',
  };

  const status = election.computedStatus || election.status;

  return (
    <Link to={`/elections/${election.id}`} className="election-card">
      <div className={`card-status status-${status?.toLowerCase()}`}>
        {statusLabels[status] || status}
      </div>
      <h3>{election.title}</h3>
      <p>{election.description?.substring(0, 100)}{election.description?.length > 100 ? '...' : ''}</p>
      <div className="card-meta">
        <span><Icon name="users" size={15} /> {election._count?.candidates || 0} Candidates</span>
        <span><Icon name="archive" size={15} /> {election.positions?.length || 0} Positions</span>
      </div>
    </Link>
  );
}
