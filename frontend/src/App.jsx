import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ElectionsPage from './pages/ElectionsPage';
import ElectionDetails from './pages/ElectionDetails';
import CandidateProfile from './pages/CandidateProfile';
import VotePage from './pages/VotePage';
import ResultsPage from './pages/ResultsPage';
import AdminDashboard from './pages/AdminDashboard';
import CandidateManagement from './pages/CandidateManagement';
import AnnouncementManagement from './pages/AnnouncementManagement';
import EligibilityPage from './pages/EligibilityPage';
import UserManagement from './pages/UserManagement';
import AccountSettings from './pages/AccountSettings';
import LiveTally from './pages/LiveTally';

function DashboardLayout({ title }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('praxis_sidebar_collapsed') === '1'
  );

  useEffect(() => {
    localStorage.setItem('praxis_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className={`dashboard-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      <div className="dashboard-main">
        <Header title={title} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner"></div> Loading...</div>;
  }
  if (!user) {
    return <LandingPage />;
  }
  return <Navigate to={user.role === 'STUDENT' ? '/dashboard' : '/admin'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student + Admin shared routes */}
          <Route element={
            <ProtectedRoute roles={['STUDENT', 'ELECTION_OFFICER', 'SUPER_ADMIN']}>
              <DashboardLayout title="Dashboard" />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/elections/:id" element={<ElectionDetails />} />
            <Route path="/elections/:electionId/results" element={<ResultsPage />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />
          </Route>

          {/* Elections list (all authenticated roles) */}
          <Route element={
            <ProtectedRoute roles={['STUDENT', 'ELECTION_OFFICER', 'SUPER_ADMIN']}>
              <DashboardLayout title="Elections" />
            </ProtectedRoute>
          }>
            <Route path="/elections" element={<ElectionsPage />} />
          </Route>

          {/* Account settings (all authenticated roles) */}
          <Route element={
            <ProtectedRoute roles={['STUDENT', 'ELECTION_OFFICER', 'SUPER_ADMIN']}>
              <DashboardLayout title="Account Settings" />
            </ProtectedRoute>
          }>
            <Route path="/account" element={<AccountSettings />} />
          </Route>

          {/* Student-only voting route */}
          <Route element={
            <ProtectedRoute roles={['STUDENT']}>
              <DashboardLayout title="Cast Vote" />
            </ProtectedRoute>
          }>
            <Route path="/elections/:electionId/vote" element={<VotePage />} />
          </Route>

          {/* Admin routes */}
          <Route element={
            <ProtectedRoute roles={['ELECTION_OFFICER', 'SUPER_ADMIN']}>
              <DashboardLayout title="Admin Panel" />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/candidates" element={<CandidateManagement />} />
            <Route path="/admin/announcements" element={<AnnouncementManagement />} />
            <Route path="/admin/eligibility" element={<EligibilityPage />} />
            <Route path="/admin/elections/:electionId/tally" element={<LiveTally />} />
          </Route>

          {/* Super Admin only */}
          <Route element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <DashboardLayout title="User Management" />
            </ProtectedRoute>
          }>
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
