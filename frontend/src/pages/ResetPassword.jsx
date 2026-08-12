import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setMessage('No reset token provided.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/reset-password', { token, newPassword });
      setMessage(data.message);
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="auth-branding-logo">P</div>
        <h2>New Password</h2>
        <p>Choose a strong password to secure your Praxis account.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Reset Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
          {message && <div className={`alert ${success ? 'alert-success' : 'alert-error'}`}>{message}</div>}
          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          <p className="auth-link"><Link to="/login">← Back to Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
