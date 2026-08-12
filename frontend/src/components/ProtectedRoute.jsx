import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        Loading...
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to root which shows the landing page
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'STUDENT' ? '/dashboard' : '/admin'} replace />;
  }

  return children;
}
