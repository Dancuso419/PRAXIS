import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import Icon from '../components/Icon';
import PasswordInput from '../components/PasswordInput';

function formatRole(role) {
  if (!role) return '';
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccountSettings() {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    faculty: user?.faculty || '',
    department: user?.department || '',
    level: user?.level || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const profileDirty =
    profile.fullName !== (user?.fullName || '') ||
    profile.faculty !== (user?.faculty || '') ||
    profile.department !== (user?.department || '') ||
    profile.level !== (user?.level || '');

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);
    try {
      await axiosInstance.put('/auth/me', profile);
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (pw.newPassword !== pw.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (pw.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    setSavingPw(true);
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update password.' });
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="admin-page account-settings">
      <div className="dashboard-header">
        <h1>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
          Manage your personal information and password.
        </p>
      </div>

      {/* Identity summary */}
      <div className="account-summary-card">
        <div className="account-summary-avatar">
          {(user?.fullName || '?').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        <div className="account-summary-info">
          <h2>{user?.fullName}</h2>
          <p>{user?.email}</p>
          <span className="account-role-badge">{formatRole(user?.role)}</span>
        </div>
      </div>

      {/* Profile */}
      <form className="create-form settings-card" onSubmit={handleProfileSave}>
        <h2 className="section-heading"><Icon name="user" size={18} /> Profile Information</h2>

        {profileMsg.text && (
          <div className={`alert alert-${profileMsg.type}`}>
            <Icon name={profileMsg.type === 'success' ? 'checkCircle' : 'alertCircle'} size={16} />
            {profileMsg.text}
          </div>
        )}

        <div className="form-group">
          <label>Full Name</label>
          <input
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Faculty</label>
            <input
              value={profile.faculty}
              onChange={(e) => setProfile({ ...profile, faculty: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Academic Level</label>
            <input
              value={profile.level}
              onChange={(e) => setProfile({ ...profile, level: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Matric / Staff ID <span className="field-locked">read-only</span></label>
            <input value={user?.matricNumber || ''} disabled />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address <span className="field-locked">read-only</span></label>
          <input value={user?.email || ''} disabled />
          <small className="field-hint">Contact an administrator to change your registered email.</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={savingProfile || !profileDirty}>
          {savingProfile ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Password */}
      <form className="create-form settings-card" onSubmit={handlePasswordSave}>
        <h2 className="section-heading"><Icon name="key" size={18} /> Change Password</h2>

        {pwMsg.text && (
          <div className={`alert alert-${pwMsg.type}`}>
            <Icon name={pwMsg.type === 'success' ? 'checkCircle' : 'alertCircle'} size={16} />
            {pwMsg.text}
          </div>
        )}

        <div className="form-group">
          <label>Current Password</label>
          <PasswordInput
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            placeholder="Enter your current password"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>New Password</label>
            <PasswordInput
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <PasswordInput
              value={pw.confirmPassword}
              onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              required
              minLength={8}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={savingPw}>
          {savingPw ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
