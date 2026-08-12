import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setSent(true);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="auth-branding-logo">P</div>
        <h2>Reset Access</h2>
        <p>We'll send you a link to reset your password and regain access to your account.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
          {message && <div className={`alert ${sent ? 'alert-success' : 'alert-error'}`}>{message}</div>}
          {!sent && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <p className="auth-link"><Link to="/login">← Back to Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
